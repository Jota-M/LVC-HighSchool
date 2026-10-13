// components/preinscripcion/PadresStep.tsx
'use client';
import React from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Button,
  IconButton,
  Chip,
  Tooltip,
  useTheme,
  FormControlLabel,
  Checkbox,
  Radio,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PeopleIcon from '@mui/icons-material/People';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import PhoneIcon from '@mui/icons-material/Phone';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';

import { PreTutorForm, PreEstudianteForm } from '@/types/preinscripcionTypes';

interface PadresStepProps {
  tutores: PreTutorForm[];
  estudiantes: PreEstudianteForm[];
  relaciones: Record<string, boolean>;
  principales?: Record<number, number>;
  principal?: string | null;
  errors: Record<string, string>;
  onChange: (index: number, field: string, value: any) => void;
  onAddTutor: () => void;
  onRemoveTutor: (index: number) => void;
  onRelacionChange: (key: string, value: boolean) => void;
  onPrincipalChange: (estudianteIndex: number, tutorIndex: number) => void;
}

const GENEROS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
];

const PARENTESCOS = [
  { value: 'padre', label: 'Padre' },
  { value: 'madre', label: 'Madre' },
  { value: 'tutor_legal', label: 'Tutor Legal / Apoderado' },
  { value: 'abuelo', label: 'Abuelo/a' },
  { value: 'tio', label: 'Tío/a' },
  { value: 'hermano_mayor', label: 'Hermano/a Mayor' },
  { value: 'otro', label: 'Otro' },
];

const ESTADOS_CIVILES = [
  { value: 'soltero', label: 'Soltero/a' },
  { value: 'casado', label: 'Casado/a' },
  { value: 'divorciado', label: 'Divorciado/a' },
  { value: 'viudo', label: 'Viudo/a' },
  { value: 'union_libre', label: 'Unión Libre' },
];

export default function PadresStep({
  tutores,
  estudiantes,
  relaciones,
  principales = {},
  principal,
  errors,
  onChange,
  onAddTutor,
  onRemoveTutor,
  onRelacionChange,
  onPrincipalChange,
}: PadresStepProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

  const cardStyle = {
    p: { xs: 2.5, md: 4 },
    mb: 4,
    borderRadius: '20px',
    border: '2px solid',
    borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.25)',
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.95)',
    boxShadow: isDark
      ? '0 10px 30px rgba(0, 0, 0, 0.4)'
      : '0 10px 30px rgba(16, 185, 129, 0.08)',
    position: 'relative' as const,
  };

  const titleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    mb: 2.5,
    fontWeight: 700,
    fontSize: '1.2rem',
    color: '#10b981',
  };

  const fieldStyle = {
    '& .MuiInputBase-root': {
      borderRadius: '12px',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.95)',
      color: isDark ? '#fff' : '#000',
    },
    '& .MuiInputLabel-root': {
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.65)',
      fontWeight: 500,
      '&.Mui-focused': {
        color: '#10b981',
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(16, 185, 129, 0.25)',
      borderWidth: '1.5px',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#10b981',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#10b981',
      borderWidth: '2px',
    },
  };

  const nombreEstudiante = (e: PreEstudianteForm, idx: number) =>
    e.nombres || e.apellido_paterno
      ? `${e.nombres} ${e.apellido_paterno}`.trim()
      : `Postulante #${idx + 1}`;

  const nombreTutor = (t: PreTutorForm, idx: number) =>
    t.nombres || t.apellido_paterno
      ? `${t.nombres} ${t.apellido_paterno}`.trim()
      : `Tutor #${idx + 1}`;

  return (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      {/* Lista de Tutores apilados hacia abajo directamente */}
      {tutores.map((tutor, index) => {
        const tituloTutor = nombreTutor(tutor, index);

        return (
          <Paper key={index} elevation={0} sx={cardStyle}>
            {/* Cabecera del Tutor con chip y botón eliminar */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                pb: 1.5,
                borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip
                  label={`Tutor #${index + 1}`}
                  sx={{
                    fontWeight: 700,
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                  }}
                />
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  {tituloTutor} {tutor.parentesco ? `(${tutor.parentesco})` : ''}
                </Typography>
              </Box>

              {tutores.length > 1 && (
                <Tooltip title="Eliminar este tutor">
                  <IconButton
                    onClick={() => onRemoveTutor(index)}
                    sx={{
                      color: '#ef4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* Sub-sección 1: Datos Personales */}
            <Box sx={titleStyle}>
              <PeopleIcon sx={{ fontSize: 26 }} />
              Datos Personales del Padre / Madre / Tutor
            </Box>

            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Nombres *"
                  value={tutor.nombres}
                  onChange={(e) => onChange(index, 'nombres', e.target.value)}
                  error={!!errors[`tutor_${index}_nombres`]}
                  helperText={errors[`tutor_${index}_nombres`]}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Apellido Paterno *"
                  value={tutor.apellido_paterno}
                  onChange={(e) => onChange(index, 'apellido_paterno', e.target.value)}
                  error={!!errors[`tutor_${index}_apellido_paterno`]}
                  helperText={errors[`tutor_${index}_apellido_paterno`]}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Apellido Materno"
                  value={tutor.apellido_materno}
                  onChange={(e) => onChange(index, 'apellido_materno', e.target.value)}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Cédula de Identidad (CI) *"
                  value={tutor.ci}
                  onChange={(e) => onChange(index, 'ci', e.target.value)}
                  error={!!errors[`tutor_${index}_ci`]}
                  helperText={errors[`tutor_${index}_ci`]}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  select
                  label="Parentesco *"
                  value={tutor.parentesco}
                  onChange={(e) => onChange(index, 'parentesco', e.target.value)}
                  error={!!errors[`tutor_${index}_parentesco`]}
                  helperText={errors[`tutor_${index}_parentesco`]}
                  sx={fieldStyle}
                >
                  {PARENTESCOS.map((op) => (
                    <MenuItem key={op.value} value={op.value}>
                      {op.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  select
                  label="Género *"
                  value={tutor.genero}
                  onChange={(e) => onChange(index, 'genero', e.target.value)}
                  error={!!errors[`tutor_${index}_genero`]}
                  helperText={errors[`tutor_${index}_genero`]}
                  sx={fieldStyle}
                >
                  {GENEROS.map((op) => (
                    <MenuItem key={op.value} value={op.value}>
                      {op.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <DatePicker
                  label="Fecha de Nacimiento"
                  format="DD/MM/YYYY"
                  value={tutor.fecha_nacimiento}
                  onChange={(val) => onChange(index, 'fecha_nacimiento', val)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: fieldStyle,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  select
                  label="Estado Civil"
                  value={tutor.estado_civil}
                  onChange={(e) => onChange(index, 'estado_civil', e.target.value)}
                  sx={fieldStyle}
                >
                  {ESTADOS_CIVILES.map((op) => (
                    <MenuItem key={op.value} value={op.value}>
                      {op.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Ocupación / Profesión"
                  value={tutor.ocupacion}
                  onChange={(e) => onChange(index, 'ocupacion', e.target.value)}
                  sx={fieldStyle}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, opacity: 0.15 }} />

            {/* Sub-sección 2: Contacto y Dirección */}
            <Box sx={titleStyle}>
              <PhoneIcon sx={{ fontSize: 26 }} />
              Contacto y Domicilio
            </Box>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Teléfono / Celular de Contacto *"
                  value={tutor.telefono}
                  onChange={(e) => onChange(index, 'telefono', e.target.value)}
                  error={!!errors[`tutor_${index}_telefono`]}
                  helperText={errors[`tutor_${index}_telefono`]}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  value={tutor.email}
                  onChange={(e) => onChange(index, 'email', e.target.value)}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label="Dirección de Domicilio"
                  value={tutor.direccion}
                  onChange={(e) => onChange(index, 'direccion', e.target.value)}
                  sx={fieldStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Zona / Barrio"
                  value={tutor.zona || ''}
                  onChange={(e) => onChange(index, 'zona', e.target.value)}
                  sx={fieldStyle}
                />
              </Grid>
            </Grid>
          </Paper>
        );
      })}

      {/* Botón para agregar otro padre/tutor directamente abajo */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button
          variant="outlined"
          size="large"
          startIcon={<AddIcon />}
          onClick={onAddTutor}
          sx={{
            borderRadius: '14px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            px: 4,
            py: 1.8,
            borderColor: '#10b981',
            color: '#10b981',
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.05)',
            borderWidth: '2px',
            '&:hover': {
              borderColor: '#10b981',
              borderWidth: '2px',
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.25s ease',
          }}
        >
          + Agregar Otro Padre / Tutor
        </Button>
      </Box>

      {/* SECCIÓN FINAL: ASIGNACIÓN Y SELECCIÓN DEL PADRE PRINCIPAL */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: '20px',
          border: '2px solid',
          borderColor: isDark ? 'rgba(250, 204, 21, 0.35)' : 'rgba(2, 136, 209, 0.35)',
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.95)',
          boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(1, 87, 155, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <FamilyRestroomIcon sx={{ fontSize: 30, color: accent }} />
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Relaciones Familiares y Tutor Principal
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Marca qué tutor es responsable de cada postulante y selecciona con el botón circular (Radio) al <strong>Tutor Principal</strong> para las comunicaciones oficiales del colegio.
        </Typography>

        {estudiantes.map((estudiante, eIdx) => (
          <Box
            key={eIdx}
            sx={{
              p: 2.5,
              mb: 2.5,
              borderRadius: '16px',
              border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} color={accent} mb={1.5}>
              👤 {nombreEstudiante(estudiante, eIdx)}
            </Typography>

            <Grid container spacing={2}>
              {tutores.map((tutor, tIdx) => {
                const key = `${eIdx}:${tIdx}`;
                const asignado = Boolean(relaciones[key]);
                const esPrincipal = principales[eIdx] !== undefined ? principales[eIdx] === tIdx : principal === key;

                return (
                  <Grid size={{ xs: 12, sm: 6 }} key={key}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        border: `1.5px solid ${esPrincipal
                            ? '#10b981'
                            : asignado
                              ? (isDark ? 'rgba(250, 204, 21, 0.5)' : 'rgba(2, 136, 209, 0.5)')
                              : isDark
                                ? 'rgba(255,255,255,0.1)'
                                : 'rgba(0,0,0,0.1)'
                          }`,
                        backgroundColor: esPrincipal
                          ? (isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)')
                          : asignado
                            ? (isDark ? 'rgba(250, 204, 21, 0.06)' : 'rgba(2, 136, 209, 0.05)')
                            : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={asignado}
                            onChange={(e) => onRelacionChange(key, e.target.checked)}
                            sx={{ color: accent, '&.Mui-checked': { color: accent } }}
                          />
                        }
                        label={
                          <Typography variant="body2" fontWeight={600} color="text.primary">
                            {nombreTutor(tutor, tIdx)} {tutor.parentesco ? `(${tutor.parentesco})` : ''}
                          </Typography>
                        }
                      />

                      {asignado && (
                        <FormControlLabel
                          control={
                            <Radio
                              name={`tutor-principal-estudiante-${eIdx}`}
                              checked={esPrincipal}
                              onChange={() => onPrincipalChange(eIdx, tIdx)}
                              size="small"
                              sx={{
                                color: '#10b981',
                                '&.Mui-checked': { color: '#10b981' },
                              }}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {esPrincipal && <StarIcon sx={{ fontSize: 16, color: '#10b981' }} />}
                              <Typography
                                variant="caption"
                                fontWeight={700}
                                color={esPrincipal ? '#10b981' : 'text.secondary'}
                              >
                                {esPrincipal ? 'Principal' : 'Hacer Principal'}
                              </Typography>
                            </Box>
                          }
                        />
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}