// components/preinscripcion/ConfirmacionStep.tsx
'use client';
import React from 'react';
import { Box, Grid, Typography, Divider, useTheme } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { PreEstudianteForm, PreTutorForm, PreInscripcionFormData } from '@/types/preinscripcionTypes';

interface ConfirmacionStepProps {
  estudiante: PreEstudianteForm;
  representante: PreTutorForm;
  documentos: PreInscripcionFormData['documentos'];
}

export default function ConfirmacionStep({ estudiante, representante, documentos }: ConfirmacionStepProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const sectionStyle = {
    backgroundColor: isDark ? 'rgba(250, 204, 21, 0.05)' : 'rgba(2, 136, 209, 0.05)',
    borderRadius: '16px',
    p: 3,
    border: isDark ? '2px solid rgba(250, 204, 21, 0.2)' : '2px solid rgba(2, 136, 209, 0.2)',
  };

  const titleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 3,
    fontWeight: 700,
    fontSize: '1.3rem',
    color: isDark ? '#facc15' : '#0288d1',
  };

  const labelStyle = {
    variant: 'caption' as const,
    sx: { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(1,87,155,0.6)', fontWeight: 600 },
  };

  const valueStyle = {
    sx: { color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(1,87,155,1)', fontWeight: 600 },
  };

  return (
    <Box sx={{ gap: 4, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 64, color: isDark ? '#facc15' : '#0288d1', mb: 2 }} />
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1, color: isDark ? '#facc15' : '#0288d1' }}>
          ¡Revisa tu Información!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Verifica que todos los datos sean correctos antes de enviar tu solicitud
        </Typography>
      </Box>

      <Divider sx={{ my: 2, opacity: 0.3 }} />

      {/* Información del Estudiante */}
      <Box sx={sectionStyle}>
        <Box sx={titleStyle}>
          <PersonIcon sx={{ fontSize: 28 }} />
          Información del Estudiante
        </Box>

        <Grid container spacing={2}>
          <Grid size={{xs:12, md:6}}>
            <Typography {...labelStyle}>Nombre Completo</Typography>
            <Typography {...valueStyle}>
              {estudiante.nombres} {estudiante.apellido_paterno} {estudiante.apellido_materno}
            </Typography>
          </Grid>
          <Grid size={{xs:12, md:3}}>
            <Typography {...labelStyle}>Cédula de Identidad</Typography>
            <Typography {...valueStyle}>{estudiante.ci || 'No proporcionado'}</Typography>
          </Grid>
          {/* 🆕 RUDE */}
          <Grid size={{xs:12, md:3}}>
            <Typography {...labelStyle}>RUDE</Typography>
            <Typography {...valueStyle}>{estudiante.rude || 'No proporcionado'}</Typography>
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <Typography {...labelStyle}>Fecha de Nacimiento</Typography>
            <Typography {...valueStyle}>
              {estudiante.fecha_nacimiento ? estudiante.fecha_nacimiento.format('DD/MM/YYYY') : 'No proporcionado'}
            </Typography>
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <Typography {...labelStyle}>Género</Typography>
            <Typography {...valueStyle}>{estudiante.genero || 'No proporcionado'}</Typography>
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <Typography {...labelStyle}>Lugar de Nacimiento</Typography>
            <Typography {...valueStyle}>{estudiante.lugar_nacimiento || 'No proporcionado'}</Typography>
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <Typography {...labelStyle}>Grado Solicitado</Typography>
            <Typography {...valueStyle}>{estudiante.grado_solicitado || 'No proporcionado'}</Typography>
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <Typography {...labelStyle}>Turno</Typography>
            <Typography {...valueStyle}>{estudiante.turno_solicitado || 'No proporcionado'}</Typography>
          </Grid>
          <Grid size={{xs:12, md:4}}>
            <Typography {...labelStyle}>¿Repite Grado?</Typography>
            <Typography {...valueStyle}>{estudiante.repite_grado ? 'Sí' : 'No'}</Typography>
          </Grid>
          {estudiante.institucion_procedencia && (
            <Grid size={{xs:12}}>
              <Typography {...labelStyle}>Institución de Procedencia</Typography>
              <Typography {...valueStyle}>{estudiante.institucion_procedencia}</Typography>
            </Grid>
          )}
          <Grid size={{xs:12, md:6}}>
            <Typography {...labelStyle}>Teléfono</Typography>
            <Typography {...valueStyle}>{estudiante.telefono || 'No proporcionado'}</Typography>
          </Grid>
          <Grid size={{xs:12, md:6}}>
            <Typography {...labelStyle}>Correo Electrónico</Typography>
            <Typography {...valueStyle}>{estudiante.email || 'No proporcionado'}</Typography>
          </Grid>
          {estudiante.contacto_emergencia && (
            <Grid size={{xs:12}}>
              <Typography {...labelStyle}>Contacto de Emergencia</Typography>
              <Typography {...valueStyle}>{estudiante.contacto_emergencia}</Typography>
            </Grid>
          )}
          {estudiante.tiene_discapacidad && (
            <Grid size={{xs:12}}>
              <Typography {...labelStyle}>Información de Discapacidad</Typography>
              <Typography {...valueStyle}>{estudiante.tipo_discapacidad || 'No especificado'}</Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Información del Representante */}
      <Box sx={sectionStyle}>
        <Box sx={titleStyle}>
          <PeopleIcon sx={{ fontSize: 28 }} />
          Información del Representante
        </Box>

        <Grid container spacing={2}>
          <Grid size={{xs:12, md:6}}>
            <Typography {...labelStyle}>Nombre Completo</Typography>
            <Typography {...valueStyle}>
              {representante.nombres} {representante.apellido_paterno} {representante.apellido_materno}
            </Typography>
          </Grid>
          <Grid size={{xs:12, md:3}}>
            <Typography {...labelStyle}>Cédula de Identidad</Typography>
            <Typography {...valueStyle}>{representante.ci}</Typography>
          </Grid>
          <Grid size={{xs:12, md:3}}>
            <Typography {...labelStyle}>Parentesco</Typography>
            <Typography {...valueStyle}>{representante.parentesco || 'No especificado'}</Typography>
          </Grid>
          {representante.tipo_representante && (
            <Grid size={{xs:12, md:6}}>
              <Typography {...labelStyle}>Tipo de Representante</Typography>
              <Typography {...valueStyle}>{representante.tipo_representante}</Typography>
            </Grid>
          )}
          <Grid size={{xs:12, md:6}}>
            <Typography {...labelStyle}>¿Vive con el estudiante?</Typography>
            <Typography {...valueStyle}>{representante.vive_con_estudiante ? 'Sí' : 'No'}</Typography>
          </Grid>
          {representante.ocupacion && (
            <Grid size={{xs:12, md:6}}>
              <Typography {...labelStyle}>Ocupación</Typography>
              <Typography {...valueStyle}>{representante.ocupacion}</Typography>
            </Grid>
          )}
          {representante.lugar_trabajo && (
            <Grid size={{xs:12, md:6}}>
              <Typography {...labelStyle}>Lugar de Trabajo</Typography>
              <Typography {...valueStyle}>{representante.lugar_trabajo}</Typography>
            </Grid>
          )}
          <Grid size={{xs:12, md:6}}>
            <Typography {...labelStyle}>Teléfono</Typography>
            <Typography {...valueStyle}>{representante.telefono}</Typography>
          </Grid>
          {representante.celular && representante.celular !== representante.telefono && (
            <Grid size={{xs:12, md:6}}>
              <Typography {...labelStyle}>Celular</Typography>
              <Typography {...valueStyle}>{representante.celular}</Typography>
            </Grid>
          )}
          {representante.email && (
            <Grid size={{xs:12, md:6}}>
              <Typography {...labelStyle}>Correo Electrónico</Typography>
              <Typography {...valueStyle}>{representante.email}</Typography>
            </Grid>
          )}
          {representante.direccion && (
            <Grid size={{xs:12}}>
              <Typography {...labelStyle}>Dirección</Typography>
              <Typography {...valueStyle}>{representante.direccion}</Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Documentos */}
      <Box sx={sectionStyle}>
        <Box sx={titleStyle}>
          <DescriptionIcon sx={{ fontSize: 28 }} />
          Documentos Adjuntos
        </Box>

        <Grid container spacing={2}>
          {Object.entries(documentos).map(([key, file]) => {
            if (!file) return null;

            const labels: Record<string, string> = {
              foto_estudiante: 'Foto del Estudiante',
              cedula_estudiante: 'Cédula del Estudiante',
              certificado_nacimiento: 'Certificado de Nacimiento',
              libreta_notas: 'Libreta de Notas',
              cedula_representante: 'Cédula del Representante',
            };

            return (
              <Grid size={{xs:12, md:6}} key={key}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: '12px',
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid #10b981',
                  }}
                >
                  <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 24 }} />
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Typography {...labelStyle}>{labels[key]}</Typography>
                    <Typography {...valueStyle} sx={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Aviso final */}
      <Box
        sx={{
          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)': 'rgba(16, 185, 129, 0.05)',
          borderRadius: '16px',
          p: 3,
          border: '2px solid #10b981',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#10b981' }}>
          ✅ Todo está listo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Al hacer clic en "Enviar Preinscripción", tu solicitud será enviada a la institución.
          Recibirás un correo de confirmación y nos pondremos en contacto contigo en breve.
        </Typography>
      </Box>
    </Box>
  );
}