// components/estudiantes/TutorFormDialog.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Divider,
  CircularProgress,
  useTheme,
  Alert,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { TutorCreate } from '@/types/estudianteTypes';
import { PadreFamiliaUpdate, RelacionTutorUpdate, TutorConRelacion } from '@/services/tutoresService';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface TutorFormValues {
  // Datos de padre_familia
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  ci: string;
  fecha_nacimiento: string;
  telefono: string;
  celular: string;
  email: string;
  direccion: string;
  ocupacion: string;
  estado_civil: string;
  // Datos de la relación estudiante_tutor
  parentesco: string;
  es_tutor_principal: boolean;
  vive_con_estudiante: boolean;
  autorizado_recoger: boolean;
  puede_autorizar_salidas: boolean;
  recibe_notificaciones: boolean;
  prioridad_contacto: number;
  observaciones: string;
}

interface TutorFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Modo crear: onSubmitNuevo. Modo editar: onSubmitEditar */
  mode: 'create' | 'edit';
  /** Solo en modo edit */
  tutorActual?: TutorConRelacion;
  onSubmitNuevo?: (
    datosTutor: TutorCreate,
    datosRelacion: Omit<RelacionTutorUpdate & { parentesco?: string }, never>
  ) => Promise<void>;
  onSubmitEditar?: (
    datosTutor: PadreFamiliaUpdate,
    datosRelacion: RelacionTutorUpdate
  ) => Promise<void>;
  onBuscarCI?: (ci: string) => Promise<{ encontrado: boolean; padre: any | null }>;
  /** Si se encontró un tutor existente por CI, se puede asignar directamente */
  onAsignarExistente?: (padreId: number, datosRelacion: any) => Promise<void>;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const PARENTESCO_OPTIONS = [
  'padre', 'madre', 'abuelo', 'abuela',
  'tío', 'tía', 'hermano', 'hermana',
  'tutor legal', 'padrino', 'madrina', 'otro',
];

const ESTADO_CIVIL_OPTIONS = [
  'soltero/a', 'casado/a', 'divorciado/a', 'viudo/a', 'conviviente',
];

const DEFAULT_FORM: TutorFormValues = {
  nombres: '', apellido_paterno: '', apellido_materno: '',
  ci: '', fecha_nacimiento: '', telefono: '', celular: '',
  email: '', direccion: '', ocupacion: '', estado_civil: '',
  parentesco: '', es_tutor_principal: false,
  vive_con_estudiante: false, autorizado_recoger: true,
  puede_autorizar_salidas: true, recibe_notificaciones: true,
  prioridad_contacto: 1, observaciones: '',
};

// ─── Componente ───────────────────────────────────────────────────────────────

export const TutorFormDialog: React.FC<TutorFormDialogProps> = ({
  open, onClose, mode, tutorActual,
  onSubmitNuevo, onSubmitEditar, onBuscarCI, onAsignarExistente,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

  const [tab, setTab] = useState(0);
  const [form, setForm] = useState<TutorFormValues>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [buscandoCI, setBuscandoCI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tutorEncontrado, setTutorEncontrado] = useState<any | null>(null);

  // Cargar datos en modo edición
  useEffect(() => {
    if (open) {
      setTab(0);
      setError(null);
      setTutorEncontrado(null);
      if (mode === 'edit' && tutorActual) {
        setForm({
          nombres: tutorActual.nombres ?? '',
          apellido_paterno: tutorActual.apellido_paterno ?? '',
          apellido_materno: tutorActual.apellido_materno ?? '',
          ci: tutorActual.ci ?? '',
          fecha_nacimiento: (tutorActual as any).fecha_nacimiento ?? '',
          telefono: tutorActual.telefono ?? '',
          celular: tutorActual.celular ?? '',
          email: tutorActual.email ?? '',
          direccion: (tutorActual as any).direccion ?? '',
          ocupacion: tutorActual.ocupacion ?? '',
          estado_civil: (tutorActual as any).estado_civil ?? '',
          parentesco: tutorActual.parentesco ?? '',
          es_tutor_principal: tutorActual.es_tutor_principal,
          vive_con_estudiante: tutorActual.vive_con_estudiante,
          autorizado_recoger: tutorActual.autorizado_recoger,
          puede_autorizar_salidas: tutorActual.puede_autorizar_salidas,
          recibe_notificaciones: tutorActual.recibe_notificaciones,
          prioridad_contacto: tutorActual.prioridad_contacto ?? 1,
          observaciones: tutorActual.observaciones ?? '',
        });
      } else {
        setForm(DEFAULT_FORM);
      }
    }
  }, [open, mode, tutorActual]);

  const set = (field: keyof TutorFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const setSwitch = (field: keyof TutorFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.checked }));

  // Buscar CI en modo crear
  const handleBuscarCI = async () => {
    if (!form.ci.trim() || !onBuscarCI) return;
    setBuscandoCI(true);
    setTutorEncontrado(null);
    setError(null);
    try {
      const result = await onBuscarCI(form.ci.trim());
      if (result.encontrado && result.padre) {
        setTutorEncontrado(result.padre);
        // Pre-llenar campos con datos encontrados
        setForm(prev => ({
          ...prev,
          nombres: result.padre.nombres ?? prev.nombres,
          apellido_paterno: result.padre.apellido_paterno ?? prev.apellido_paterno,
          apellido_materno: result.padre.apellido_materno ?? prev.apellido_materno,
          telefono: result.padre.telefono ?? prev.telefono,
          celular: result.padre.celular ?? prev.celular,
          email: result.padre.email ?? prev.email,
          ocupacion: result.padre.ocupacion ?? prev.ocupacion,
        }));
      }
    } catch {
      // Si no existe, no pasa nada — se creará uno nuevo
    } finally {
      setBuscandoCI(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.nombres.trim() || !form.apellido_paterno.trim()) {
      setError('Nombres y apellido paterno son requeridos.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (mode === 'create') {
        const datosRelacion = {
          parentesco: form.parentesco,
          es_tutor_principal: form.es_tutor_principal,
          vive_con_estudiante: form.vive_con_estudiante,
          autorizado_recoger: form.autorizado_recoger,
          puede_autorizar_salidas: form.puede_autorizar_salidas,
          recibe_notificaciones: form.recibe_notificaciones,
          prioridad_contacto: form.prioridad_contacto,
          observaciones: form.observaciones,
        };

        if (tutorEncontrado && onAsignarExistente) {
          // Tutor ya existe en el sistema → solo crear relación
          await onAsignarExistente(tutorEncontrado.id, {
            padre_familia_id: tutorEncontrado.id,
            ...datosRelacion,
          });
        } else if (onSubmitNuevo) {
          // Tutor nuevo → crear padre_familia + relación
          const datosTutor: TutorCreate = {
            nombres: form.nombres,
            apellido_paterno: form.apellido_paterno,
            apellido_materno: form.apellido_materno || undefined,
            ci: form.ci,
            fecha_nacimiento: form.fecha_nacimiento || undefined,
            telefono: form.telefono || undefined,
            celular: form.celular || undefined,
            email: form.email || undefined,
            direccion: form.direccion || undefined,
            ocupacion: form.ocupacion || undefined,
            parentesco: form.parentesco || undefined,
            estado_civil: form.estado_civil || undefined,
            es_tutor_principal: form.es_tutor_principal,
            vive_con_estudiante: form.vive_con_estudiante,
            autorizado_recoger: form.autorizado_recoger,
            puede_autorizar_salidas: form.puede_autorizar_salidas,
            recibe_notificaciones: form.recibe_notificaciones,
            prioridad_contacto: form.prioridad_contacto,
          };
          await onSubmitNuevo(datosTutor, datosRelacion);
        }
      } else if (mode === 'edit' && onSubmitEditar) {
        const datosTutor: PadreFamiliaUpdate = {
          nombres: form.nombres,
          apellido_paterno: form.apellido_paterno,
          apellido_materno: form.apellido_materno || undefined,
          ci: form.ci || undefined,
          fecha_nacimiento: form.fecha_nacimiento || undefined,
          telefono: form.telefono || undefined,
          celular: form.celular || undefined,
          email: form.email || undefined,
          direccion: form.direccion || undefined,
          ocupacion: form.ocupacion || undefined,
          parentesco: form.parentesco || undefined,
          estado_civil: form.estado_civil || undefined,
        };
        const datosRelacion: RelacionTutorUpdate = {
          parentesco: form.parentesco || undefined,
          es_tutor_principal: form.es_tutor_principal,
          vive_con_estudiante: form.vive_con_estudiante,
          autorizado_recoger: form.autorizado_recoger,
          puede_autorizar_salidas: form.puede_autorizar_salidas,
          recibe_notificaciones: form.recibe_notificaciones,
          prioridad_contacto: form.prioridad_contacto,
          observaciones: form.observaciones || undefined,
        };
        await onSubmitEditar(datosTutor, datosRelacion);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Ocurrió un error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  const inputSx = { '& .MuiInputBase-root': { borderRadius: '10px' } };
  const sectionBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          bgcolor: isDark ? '#0f172a' : '#fff',
          backgroundImage: 'none',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3, py: 2.5,
          background: isDark
            ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
            : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PersonIcon sx={{ color: isDark ? '#000' : '#fff' }} />
          <Typography variant="h6" fontWeight={700} sx={{ color: isDark ? '#000' : '#fff' }}>
            {mode === 'create' ? 'Agregar Tutor' : 'Editar Tutor'}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: isDark ? '#000' : '#fff' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          px: 2, pt: 1,
          '& .Mui-selected': { color: accent },
          '& .MuiTabs-indicator': { bgcolor: accent },
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
        }}
      >
        <Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label="Datos personales" />
        <Tab icon={<ShieldIcon fontSize="small" />} iconPosition="start" label="Relación y permisos" />
      </Tabs>
      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {tutorEncontrado && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: '12px' }}>
            Tutor encontrado en el sistema: <strong>{tutorEncontrado.nombres} {tutorEncontrado.apellido_paterno}</strong>.
            Se asignará al estudiante con los datos de relación que ingreses.
          </Alert>
        )}

        {/* ── TAB 0: Datos personales ── */}
        {tab === 0 && (
          <Box>
            {/* CI con búsqueda (solo en crear) */}
            {mode === 'create' && (
              <Box sx={{ mb: 3 }}>
                <SectionLabel icon={<SearchIcon />} label="Buscar por CI (opcional)" accent={accent} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="Cédula de identidad"
                    value={form.ci}
                    onChange={set('ci')}
                    size="small"
                    sx={{ ...inputSx, flex: 1 }}
                    placeholder="Busca si el tutor ya existe"
                  />
                  <Button
                    variant="outlined"
                    onClick={handleBuscarCI}
                    disabled={buscandoCI || !form.ci.trim()}
                    sx={{
                      borderRadius: '10px', textTransform: 'none', fontWeight: 600,
                      borderColor: accent, color: accent,
                      '&:hover': { borderColor: accent, bgcolor: isDark ? 'rgba(250,204,21,0.08)' : 'rgba(2,136,209,0.08)' },
                    }}
                  >
                    {buscandoCI ? <CircularProgress size={18} /> : 'Buscar'}
                  </Button>
                </Box>
              </Box>
            )}

            <SectionLabel icon={<PersonIcon />} label="Datos personales" accent={accent} />
            <Box sx={{ bgcolor: sectionBg, borderRadius: '16px', p: 2.5, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={5}>
                  <TextField fullWidth size="small" label="Nombres *" value={form.nombres} onChange={set('nombres')} sx={inputSx} />
                </Grid>
                <Grid item xs={12} md={3.5}>
                  <TextField fullWidth size="small" label="Apellido paterno *" value={form.apellido_paterno} onChange={set('apellido_paterno')} sx={inputSx} />
                </Grid>
                <Grid item xs={12} md={3.5}>
                  <TextField fullWidth size="small" label="Apellido materno" value={form.apellido_materno} onChange={set('apellido_materno')} sx={inputSx} />
                </Grid>
                {mode === 'edit' && (
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth size="small" label="CI" value={form.ci} onChange={set('ci')} sx={inputSx} />
                  </Grid>
                )}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth size="small" label="Fecha de nacimiento" type="date"
                    value={form.fecha_nacimiento} onChange={set('fecha_nacimiento')}
                    sx={inputSx} InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField select fullWidth size="small" label="Estado civil" value={form.estado_civil} onChange={set('estado_civil')} sx={inputSx}>
                    <MenuItem value=""><em>No especificado</em></MenuItem>
                    {ESTADO_CIVIL_OPTIONS.map(o => (
                      <MenuItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" label="Ocupación" value={form.ocupacion} onChange={set('ocupacion')} sx={inputSx} />
                </Grid>
              </Grid>
            </Box>

            <SectionLabel icon={<PhoneIcon />} label="Contacto" accent={accent} />
            <Box sx={{ bgcolor: sectionBg, borderRadius: '16px', p: 2.5 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" label="Teléfono" value={form.telefono} onChange={set('telefono')} sx={inputSx} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" label="Celular" value={form.celular} onChange={set('celular')} sx={inputSx} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" label="Email" type="email" value={form.email} onChange={set('email')} sx={inputSx} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Dirección" value={form.direccion} onChange={set('direccion')} sx={inputSx} />
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}

        {/* ── TAB 1: Relación y permisos ── */}
        {tab === 1 && (
          <Box>
            <SectionLabel icon={<StarIcon />} label="Relación con el estudiante" accent={accent} />
            <Box sx={{ bgcolor: sectionBg, borderRadius: '16px', p: 2.5, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField select fullWidth size="small" label="Parentesco" value={form.parentesco} onChange={set('parentesco')} sx={inputSx}>
                    <MenuItem value=""><em>No especificado</em></MenuItem>
                    {PARENTESCO_OPTIONS.map(o => (
                      <MenuItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth size="small" label="Prioridad de contacto" type="number"
                    value={form.prioridad_contacto} onChange={set('prioridad_contacto')}
                    inputProps={{ min: 1, max: 10 }} sx={inputSx}
                  />
                </Grid>
              </Grid>
            </Box>

            <SectionLabel icon={<ShieldIcon />} label="Permisos y configuración" accent={accent} />
            <Box sx={{ bgcolor: sectionBg, borderRadius: '16px', p: 2.5, mb: 3 }}>
              <Grid container spacing={1}>
                {[
                  { field: 'es_tutor_principal', label: 'Tutor principal' },
                  { field: 'vive_con_estudiante', label: 'Vive con el estudiante' },
                  { field: 'autorizado_recoger', label: 'Autorizado a recoger' },
                  { field: 'puede_autorizar_salidas', label: 'Puede autorizar salidas' },
                  { field: 'recibe_notificaciones', label: 'Recibe notificaciones' },
                ].map(({ field, label }) => (
                  <Grid item xs={12} sm={6} key={field}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form[field as keyof TutorFormValues] as boolean}
                          onChange={setSwitch(field as keyof TutorFormValues)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: accent },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: accent },
                          }}
                        />
                      }
                      label={<Typography variant="body2" fontWeight={600}>{label}</Typography>}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <SectionLabel icon={<PersonIcon />} label="Observaciones" accent={accent} />
            <TextField
              fullWidth multiline rows={3} size="small"
              label="Observaciones de la relación"
              value={form.observaciones} onChange={set('observaciones')}
              sx={{ ...inputSx, '& .MuiInputBase-root': { borderRadius: '12px' } }}
            />
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {tab === 1 && (
            <Button onClick={() => setTab(0)} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '10px', color: 'text.secondary' }}>
              ← Anterior
            </Button>
          )}
          {tab === 0 && (
            <Button
              onClick={() => setTab(1)} variant="outlined"
              sx={{
                textTransform: 'none', fontWeight: 600, borderRadius: '10px',
                borderColor: accent, color: accent,
              }}
            >
              Siguiente →
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '10px', color: 'text.secondary' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{
              textTransform: 'none', fontWeight: 700, borderRadius: '10px', px: 3,
              bgcolor: accent, color: isDark ? '#000' : '#fff',
              '&:hover': { bgcolor: isDark ? '#e5b800' : '#0277bd' },
            }}
          >
            {loading ? 'Guardando...' : mode === 'create' ? 'Agregar tutor' : 'Guardar cambios'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

const SectionLabel: React.FC<{ icon: React.ReactNode; label: string; accent: string }> = ({ icon, label, accent }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
    <Box sx={{ color: accent, display: 'flex', alignItems: 'center', fontSize: 18 }}>{icon}</Box>
    <Typography variant="caption" fontWeight={700} color="text.secondary"
      sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.68rem' }}>
      {label}
    </Typography>
  </Box>
);