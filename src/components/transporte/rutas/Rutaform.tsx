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
  Paper,
  Divider,
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
} from '@mui/icons-material';
import type { CrearRutaRequest } from '@/types/transporte';

interface RutaFormProps {
  formData: CrearRutaRequest;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  modoEdicion?: boolean;
}

const FormSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = React.memo(({ title, icon, children }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const yellowColor = '#facc15';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: '20px',
        border: `1px solid ${alpha(yellowColor, 0.2)}`,
        backgroundColor: isDark ? alpha('#1e293b', 0.5) : alpha('#fff', 0.8),
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: alpha(yellowColor, 0.4),
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box
          sx={{
            color: yellowColor,
            display: 'flex',
            backgroundColor: alpha(yellowColor, 0.15),
            p: 1,
            borderRadius: '10px',
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" fontWeight={700} color={yellowColor}>
          {title}
        </Typography>
      </Box>
      <Divider sx={{ mb: 3, borderColor: alpha(yellowColor, 0.1) }} />
      {children}
    </Paper>
  );
});

FormSection.displayName = 'FormSection';

export const RutaForm: React.FC<RutaFormProps> = React.memo(({ formData, onChange, modoEdicion = false }) => {
  const yellowColor = '#facc15';

  return (
    <Box>
      <FormSection title="Información Básica" icon={<BusIcon />}>
        <Grid container spacing={2.5}>
          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label="Código de Ruta"
              name="codigo"
              value={formData.codigo}
              onChange={onChange}
              required
              disabled={modoEdicion}
              placeholder="Ej: RTA-001"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusIcon sx={{ color: yellowColor, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                },
              }}
            />
          </Grid>
          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label="Nombre de la Ruta"
              name="nombre"
              value={formData.nombre}
              onChange={onChange}
              required
              placeholder="Ej: Ruta Centro - Zona Norte"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                },
              }}
            />
          </Grid>
          <Grid size={{xs:12}}>
            <TextField
              fullWidth
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={onChange}
              multiline
              rows={3}
              placeholder="Describe la ruta..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                },
              }}
            />
          </Grid>
        </Grid>
      </FormSection>

      <FormSection title="Recorrido y Zona" icon={<PlaceIcon />}>
        <Grid container spacing={2.5}>
          <Grid size={{xs:12}}>
            <TextField
              fullWidth
              label="Zona de Cobertura"
              name="zona_cobertura"
              value={formData.zona_cobertura}
              onChange={onChange}
              placeholder="Ej: Zona Norte, Sur, Centro"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PlaceIcon sx={{ color: yellowColor, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                },
              }}
            />
          </Grid>
          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label="Punto de Inicio"
              name="punto_inicio"
              value={formData.punto_inicio}
              onChange={onChange}
              placeholder="Punto de partida"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                },
              }}
            />
          </Grid>
          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label="Punto Final"
              name="punto_fin"
              value={formData.punto_fin}
              onChange={onChange}
              placeholder="Destino final"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                },
              }}
            />
          </Grid>
        </Grid>
      </FormSection>

      <FormSection title="Horarios y Capacidad" icon={<ScheduleIcon />}>
        <Grid container spacing={2.5}>
          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label="Horario de Ida"
              name="horario_ida"
              type="time"
              value={formData.horario_ida}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ScheduleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                },
              }}
            />
          </Grid>
          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label="Horario de Retorno"
              name="horario_retorno"
              type="time"
              value={formData.horario_retorno}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ScheduleIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                },
              }}
            />
          </Grid>
          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label="Capacidad Máxima"
              name="capacidad_maxima"
              type="number"
              value={formData.capacidad_maxima}
              onChange={onChange}
              required
              inputProps={{ min: 1, max: 100 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: yellowColor, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                },
              }}
            />
          </Grid>
          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label="Costo Mensual (Bs)"
              name="costo_mensual"
              type="number"
              value={formData.costo_mensual}
              onChange={onChange}
              required
              inputProps={{ min: 0, step: 0.01 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon sx={{ color: '#10b981', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                },
              }}
            />
          </Grid>
        </Grid>
      </FormSection>

      <FormSection title="Información del Conductor" icon={<PersonIcon />}>
        <Grid container spacing={2.5}>
          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label="Conductor Responsable"
              name="conductor_responsable"
              value={formData.conductor_responsable}
              onChange={onChange}
              placeholder="Nombre completo"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                },
              }}
            />
          </Grid>
          <Grid size={{xs:12, sm:6}}>
            <TextField
              fullWidth
              label="Teléfono del Conductor"
              name="telefono_conductor"
              value={formData.telefono_conductor}
              onChange={onChange}
              placeholder="+591 77123456"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ color: '#10b981', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                },
              }}
            />
          </Grid>
        </Grid>
      </FormSection>

      <FormSection title="Información del Vehículo" icon={<CarIcon />}>
        <Grid container spacing={2.5}>
          <Grid size={{xs:12, sm:4}}>
            <TextField
              fullWidth
              label="Placa del Vehículo"
              name="placa_vehiculo"
              value={formData.placa_vehiculo}
              onChange={onChange}
              placeholder="1234ABC"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CarIcon sx={{ color: yellowColor, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                },
                '& input': {
                  textTransform: 'uppercase',
                  fontWeight: 600,
                },
              }}
            />
          </Grid>
          <Grid size={{xs:12, sm:4}}>
            <TextField
              fullWidth
              label="Modelo del Vehículo"
              name="modelo_vehiculo"
              value={formData.modelo_vehiculo}
              onChange={onChange}
              placeholder="Toyota Hiace"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                },
              }}
            />
          </Grid>
          <Grid size={{xs:12, sm:4}}>
            <TextField
              fullWidth
              label="Año"
              name="anio_vehiculo"
              type="number"
              value={formData.anio_vehiculo || ''}
              onChange={onChange}
              placeholder="2020"
              inputProps={{ min: 1990, max: new Date().getFullYear() + 1 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                },
              }}
            />
          </Grid>
        </Grid>
      </FormSection>

      <FormSection title="Observaciones" icon={<NotesIcon />}>
        <Grid container spacing={2.5}>
          <Grid size={{xs:12}}>
            <TextField
              fullWidth
              label="Observaciones Adicionales"
              name="observaciones"
              value={formData.observaciones}
              onChange={onChange}
              multiline
              rows={4}
              placeholder="Notas adicionales..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                },
              }}
            />
          </Grid>
        </Grid>
      </FormSection>
    </Box>
  );
});

RutaForm.displayName = 'RutaForm';

export default RutaForm;