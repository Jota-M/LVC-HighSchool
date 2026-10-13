// components/preinscripcion/ConfirmacionStep.tsx
'use client';
import React from 'react';
import { Box, Grid, Typography, Divider, Paper, Chip, useTheme } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';

import { PreEstudianteForm, PreTutorForm } from '@/types/preinscripcionTypes';

interface ConfirmacionStepProps {
  estudiantes: PreEstudianteForm[];
  tutores: PreTutorForm[];
  relaciones: Record<string, boolean>;
  principales?: Record<number, number>;
  principal?: string | null;
}

export default function ConfirmacionStep({
  estudiantes,
  tutores,
  relaciones,
  principales = {},
  principal,
}: ConfirmacionStepProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

  const sectionStyle = {
    backgroundColor: isDark ? 'rgba(250, 204, 21, 0.04)' : 'rgba(2, 136, 209, 0.04)',
    borderRadius: '16px',
    p: 3,
    border: isDark ? '1px solid rgba(250, 204, 21, 0.15)' : '1px solid rgba(2, 136, 209, 0.15)',
  };

  const titleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    mb: 2,
    fontWeight: 700,
    fontSize: '1.15rem',
    color: accent,
  };

  const labelStyle = {
    variant: 'caption' as const,
    sx: { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 },
  };

  const valueStyle = {
    sx: { color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(1,87,155,1)', fontWeight: 600 },
  };

  return (
    <Box sx={{ gap: 4, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 60, color: accent, mb: 1.5 }} />
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1, color: accent }}>
          ¡Revisa tu Información Familiar!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Verifica que los datos de los estudiantes y tutores sean correctos antes de enviar la solicitud.
        </Typography>
      </Box>

      {/* 1. ESTUDIANTES POSTULADOS */}
      <Box sx={sectionStyle}>
        <Box sx={titleStyle}>
          <SchoolIcon sx={{ fontSize: 26 }} />
          Estudiantes Postulados ({estudiantes.length})
        </Box>

        <Grid container spacing={3}>
          {estudiantes.map((estudiante, idx) => (
            <Grid size={{ xs: 12, md: estudiantes.length > 1 ? 6 : 12 }} key={idx}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Chip
                    label={`Hijo #${idx + 1}`}
                    size="small"
                    sx={{ backgroundColor: isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(2, 136, 209, 0.15)', color: accent, fontWeight: 700 }}
                  />
                  <Typography variant="body2" fontWeight={700} color={accent}>
                    {estudiante.grado_solicitado || 'Sin grado'} - {estudiante.turno_solicitado || 'Sin turno'}
                  </Typography>
                </Box>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12 }}>
                    <Typography {...labelStyle}>Nombre Completo</Typography>
                    <Typography {...valueStyle}>
                      {estudiante.nombres} {estudiante.apellido_paterno} {estudiante.apellido_materno}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography {...labelStyle}>CI</Typography>
                    <Typography {...valueStyle}>{estudiante.ci || 'Sin CI'}</Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography {...labelStyle}>RUDE</Typography>
                    <Typography {...valueStyle}>{estudiante.rude || 'No proporcionado'}</Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography {...labelStyle}>Fecha de Nacimiento</Typography>
                    <Typography {...valueStyle}>
                      {estudiante.fecha_nacimiento ? estudiante.fecha_nacimiento.format('DD/MM/YYYY') : 'No registrada'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography {...labelStyle}>Género</Typography>
                    <Typography {...valueStyle}>{estudiante.genero || 'No indicado'}</Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography {...labelStyle}>Colegio de Procedencia</Typography>
                    <Typography {...valueStyle}>{estudiante.institucion_procedencia || 'No indicado'}</Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography {...labelStyle}>Dirección y Residencia</Typography>
                    <Typography {...valueStyle}>
                      {[estudiante.direccion, estudiante.zona ? `Zona: ${estudiante.zona}` : '', estudiante.ciudad].filter(Boolean).join(' — ') || 'No especificada'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography {...labelStyle}>¿Tiene Discapacidad?</Typography>
                    <Typography {...valueStyle}>
                      {estudiante.tiene_discapacidad
                        ? `Sí (${estudiante.tipo_discapacidad || 'Sin especificar'})`
                        : 'No'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 2. TUTORES REGISTRADOS */}
      <Box sx={sectionStyle}>
        <Box sx={titleStyle}>
          <PeopleIcon sx={{ fontSize: 26 }} />
          Padres y Tutores Responsables ({tutores.length})
        </Box>

        <Grid container spacing={3}>
          {tutores.map((tutor, idx) => (
            <Grid size={{ xs: 12, md: tutores.length > 1 ? 6 : 12 }} key={idx}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Chip
                    label={`Tutor #${idx + 1}`}
                    size="small"
                    sx={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }}
                  />
                  <Typography variant="body2" fontWeight={700} color="#10b981">
                    {tutor.parentesco || 'Tutor'}
                  </Typography>
                </Box>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12 }}>
                    <Typography {...labelStyle}>Nombre Completo</Typography>
                    <Typography {...valueStyle}>
                      {tutor.nombres} {tutor.apellido_paterno} {tutor.apellido_materno}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography {...labelStyle}>CI</Typography>
                    <Typography {...valueStyle}>{tutor.ci}</Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography {...labelStyle}>Teléfono / Celular</Typography>
                    <Typography {...valueStyle}>{tutor.telefono || tutor.celular || 'Sin teléfono'}</Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography {...labelStyle}>Correo</Typography>
                    <Typography {...valueStyle}>{tutor.email || 'No proporcionado'}</Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography {...labelStyle}>Ocupación</Typography>
                    <Typography {...valueStyle}>{tutor.ocupacion || 'No proporcionada'}</Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography {...labelStyle}>Domicilio</Typography>
                    <Typography {...valueStyle}>
                      {[tutor.direccion, tutor.zona ? `Zona: ${tutor.zona}` : ''].filter(Boolean).join(' — ') || 'No proporcionado'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 3. ASIGNACIONES FAMILIARES */}
      <Box sx={sectionStyle}>
        <Box sx={titleStyle}>
          <FamilyRestroomIcon sx={{ fontSize: 26 }} />
          Relaciones y Tutor Principal
        </Box>

        <Grid container spacing={2}>
          {estudiantes.map((est, eIdx) => {
            const tutoresAsignados = tutores
              .map((tut, tIdx) => ({
                tutor: tut,
                asignado: Boolean(relaciones[`${eIdx}:${tIdx}`]),
                esPrincipal: principales[eIdx] !== undefined ? principales[eIdx] === tIdx : principal === `${eIdx}:${tIdx}`,
              }))
              .filter((x) => x.asignado);

            return (
              <Grid size={{ xs: 12, md: 6 }} key={eIdx}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
                  }}
                >
                  <Typography fontWeight={700} color={accent} mb={1}>
                    🎓 {est.nombres} {est.apellido_paterno}
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={0.5}>
                    {tutoresAsignados.map((item, i) => (
                      <Typography key={i} variant="body2" color="text.secondary">
                        • {item.tutor.nombres} {item.tutor.apellido_paterno} ({item.tutor.parentesco || 'Tutor'})
                        {item.esPrincipal && (
                          <Chip label="Principal" size="small" color="primary" sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />
                        )}
                      </Typography>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
}