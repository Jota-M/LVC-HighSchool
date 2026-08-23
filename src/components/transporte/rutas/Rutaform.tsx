// components/transporte/RutaForm.tsx
'use client';
import React from 'react';
import {
  Grid,
  TextField,
  Box,
  Typography,
  InputAdornment,
  alpha,
  useTheme,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
  Place as PlaceIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  DriveEta as CarIcon,
  AttachMoney as MoneyIcon,
  Notes as NotesIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import type { CrearRutaRequest } from '@/types/transporte';

interface RutaFormProps {
  formData: CrearRutaRequest;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: any } }) => void;
  modoEdicion?: boolean;
}

// ── card de sección: ícono + título dentro de una caja con borde, ──────────
// ── mismo lenguaje que los recuadros de variantes/dropzone del modal ──────
const FormSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  brand: string;
  bgFieldAlt: string;
  borderField: string;
  isDark: boolean;
  children: React.ReactNode;
}> = React.memo(({ title, icon, brand, bgFieldAlt, borderField, isDark, children }) => (
  <Box
    sx={{
      p: 2.25,
      borderRadius: '16px',
      background: bgFieldAlt,
      border: `1px solid ${borderField}`,
      transition: 'border-color 0.15s',
      '&:hover': { borderColor: alpha(brand, 0.35) },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
      <Box
        sx={{
          width: 30, height: 30, borderRadius: '9px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: alpha(brand, 0.15),
          border: `1px solid ${alpha(brand, 0.3)}`,
        }}
      >
        <Box sx={{ color: brand, display: 'flex', '& svg': { fontSize: 16 } }}>{icon}</Box>
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: 'text.primary' }}>
        {title}
      </Typography>
    </Box>
    {children}
  </Box>
));

FormSection.displayName = 'FormSection';

export const RutaForm: React.FC<RutaFormProps> = React.memo(({ formData, onChange, modoEdicion = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── tokens (mismos que RutaDetallesDialog / ProductoFormDialog) ───────────
  const brand = isDark ? '#facc15' : '#f59e0b';
  const bgField = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)';
  const bgFieldAlt = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)';
  const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const R = '14px';

  const isRutaActiva = formData.activo ?? true;

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: R,
      background: bgField,
      '& fieldset': { borderColor: borderField, borderRadius: R },
      '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
      '&.Mui-focused fieldset': { borderColor: brand, borderWidth: '1.5px', borderRadius: R },
      '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(brand, 0.12)}`, borderRadius: R },
      '&.Mui-disabled': { opacity: 0.6 },
    },
    '& .MuiInputLabel-root': { color: 'text.secondary' },
    '& .MuiInputLabel-root.Mui-focused': { color: brand },
  };

  const sectionProps = { brand, bgFieldAlt, borderField, isDark };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* ── Información básica ── */}
      <FormSection title="Información básica" icon={<BusIcon />} {...sectionProps}>
        <Grid container spacing={1.75}>
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                background: isRutaActiva ? alpha('#10b981', 0.08) : alpha('#ef4444', 0.08),
                border: `1px solid ${isRutaActiva ? alpha('#10b981', 0.3) : alpha('#ef4444', 0.3)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: isRutaActiva ? '#10b981' : '#ef4444',
                    boxShadow: `0 0 8px ${isRutaActiva ? '#10b981' : '#ef4444'}`,
                  }}
                />
                <Box>
                  <Typography variant="body2" fontWeight={800} color="text.primary">
                    Estado: {isRutaActiva ? 'Activa' : 'Inactiva'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {isRutaActiva
                      ? 'La ruta está habilitada para asignar estudiantes y operar normalmente'
                      : 'La ruta está deshabilitada'}
                  </Typography>
                </Box>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={isRutaActiva}
                    onChange={(e) =>
                      onChange({
                        target: { name: 'activo', value: e.target.checked } as any,
                      } as any)
                    }
                    color="success"
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Código de ruta"
              name="codigo"
              value={formData.codigo}
              onChange={onChange}
              required
              disabled={modoEdicion}
              placeholder="Ej: RTA-001"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusIcon sx={{ color: brand, fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Nombre de la ruta"
              name="nombre"
              value={formData.nombre}
              onChange={onChange}
              required
              placeholder="Ej: Ruta Centro - Zona Norte"
              sx={fieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={onChange}
              multiline
              rows={2}
              placeholder="Describe la ruta..."
              sx={fieldSx}
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* ── Recorrido y zona ── */}
      <FormSection title="Recorrido y zona" icon={<PlaceIcon />} {...sectionProps}>
        <Grid container spacing={1.75}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              label="Zona de cobertura"
              name="zona_cobertura"
              value={formData.zona_cobertura}
              onChange={onChange}
              placeholder="Ej: Zona Norte, Sur, Centro"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PlaceIcon sx={{ color: brand, fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Punto de inicio"
              name="punto_inicio"
              value={formData.punto_inicio}
              onChange={onChange}
              placeholder="Punto de partida"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Punto final"
              name="punto_fin"
              value={formData.punto_fin}
              onChange={onChange}
              placeholder="Destino final"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* ── Horarios y capacidad ── */}
      <FormSection title="Horarios y capacidad" icon={<ScheduleIcon />} {...sectionProps}>
        <Grid container spacing={1.75}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Horario de ida"
              name="horario_ida"
              type="time"
              value={formData.horario_ida}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ArrowUpwardIcon sx={{ color: '#10b981', fontSize: 16 }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Horario de retorno"
              name="horario_retorno"
              type="time"
              value={formData.horario_retorno}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ArrowDownwardIcon sx={{ color: '#ef4444', fontSize: 16 }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Capacidad máxima"
              name="capacidad_maxima"
              type="number"
              value={formData.capacidad_maxima}
              onChange={onChange}
              required
              inputProps={{ min: 1, max: 100 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: brand, fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Costo mensual (Bs)"
              name="costo_mensual"
              type="number"
              value={formData.costo_mensual}
              onChange={onChange}
              required
              inputProps={{ min: 0, step: 0.01 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon sx={{ color: '#10b981', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* ── Conductor ── */}
      <FormSection title="Información del conductor" icon={<PersonIcon />} {...sectionProps}>
        <Grid container spacing={1.75}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Conductor responsable"
              name="conductor_responsable"
              value={formData.conductor_responsable}
              onChange={onChange}
              placeholder="Nombre completo"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#3b82f6', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Teléfono del conductor"
              name="telefono_conductor"
              value={formData.telefono_conductor}
              onChange={onChange}
              placeholder="+591 77123456"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ color: '#10b981', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* ── Vehículo ── */}
      <FormSection title="Información del vehículo" icon={<CarIcon />} {...sectionProps}>
        <Grid container spacing={1.75}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Placa del vehículo"
              name="placa_vehiculo"
              value={formData.placa_vehiculo}
              onChange={onChange}
              placeholder="1234ABC"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CarIcon sx={{ color: brand, fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                ...fieldSx,
                '& input': { textTransform: 'uppercase', fontWeight: 700 },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Modelo del vehículo"
              name="modelo_vehiculo"
              value={formData.modelo_vehiculo}
              onChange={onChange}
              placeholder="Toyota Hiace"
              sx={fieldSx}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Año"
              name="anio_vehiculo"
              type="number"
              value={formData.anio_vehiculo || ''}
              onChange={onChange}
              placeholder="2020"
              inputProps={{ min: 1990, max: new Date().getFullYear() + 1 }}
              sx={fieldSx}
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* ── Observaciones ── */}
      <FormSection title="Observaciones" icon={<NotesIcon />} {...sectionProps}>
        <TextField
          fullWidth
          size="small"
          label="Observaciones adicionales"
          name="observaciones"
          value={formData.observaciones}
          onChange={onChange}
          multiline
          rows={3}
          placeholder="Notas adicionales..."
          sx={fieldSx}
        />
      </FormSection>
    </Box>
  );
});

RutaForm.displayName = 'RutaForm';

export default RutaForm;