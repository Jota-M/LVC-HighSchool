// components/estudiantes/registro/ConfirmacionStep.tsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  useTheme,
  Avatar,
} from '@mui/material';

import {
  Person as PersonIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  UploadFile as UploadIcon,
  VpnKey as KeyIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { Dayjs } from 'dayjs';

interface ConfirmacionStepProps {
  estudiante: any;
  foto: File | null;
  tutores: any[];
  crearUsuarioEstudiante: boolean;
  crearUsuariosTutores: boolean;
  credencialesEstudiante: any;
  credencialesTutores: any[];
  incluirMatricula: boolean;
  matricula: any;
  documentos: any[];
}

export const ConfirmacionStep: React.FC<ConfirmacionStepProps> = ({
  estudiante,
  foto,
  tutores,
  crearUsuarioEstudiante,
  crearUsuariosTutores,
  credencialesEstudiante,
  credencialesTutores,
  incluirMatricula,
  matricula,
  documentos,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const paperStyle = {
    p: 3,
    mb: 3,
    borderRadius: '16px',
    backgroundColor: isDark ? 'rgba(250, 204, 21, 0.05)' : 'rgba(2, 136, 209, 0.05)',
    border: '2px solid',
    borderColor: isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(2, 136, 209, 0.2)',
  };

  const sectionTitle = {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 3,
    color: isDark ? '#facc15' : '#0288d1',
  };

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckIcon
          sx={{
            fontSize: 64,
            color: '#10b981',
            mb: 2,
          }}
        />
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            background: isDark
              ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
              : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Revisa tu Información
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Verifica que todos los datos sean correctos antes de enviar
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Estudiante */}
      <Paper elevation={0} sx={paperStyle}>
        <Box sx={sectionTitle}>
          <PersonIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700}>
            Información del Estudiante
          </Typography>
        </Box>

        {foto && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Avatar
              src={URL.createObjectURL(foto)}
              sx={{
                width: 100,
                height: 100,
                border: '3px solid',
                borderColor: isDark ? '#facc15' : '#0288d1',
              }}
            />
          </Box>
        )}

        <Grid container spacing={2}>
          <Grid size={{xs:12, md:6}} >
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Nombre Completo
            </Typography>
            <Typography fontWeight={600}>
              {estudiante.nombres} {estudiante.apellido_paterno} {estudiante.apellido_materno}
            </Typography>
          </Grid>
          <Grid size={{xs:12, md:3}} >
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              CI
            </Typography>
            <Typography fontWeight={600}>{estudiante.ci || 'No especificado'}</Typography>
          </Grid>
          <Grid size={{xs:12, md:3}} >
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Fecha de Nacimiento
            </Typography>
            <Typography fontWeight={600}>
              {estudiante.fecha_nacimiento
                ? (estudiante.fecha_nacimiento as Dayjs).format('DD/MM/YYYY')
                : 'No especificado'}
            </Typography>
          </Grid>
          <Grid size={{xs:12, md:3}} >
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Género
            </Typography>
            <Typography fontWeight={600}>{estudiante.genero || 'No especificado'}</Typography>
          </Grid>
          <Grid size={{xs:12, md:3}} >
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Dirección
            </Typography>
            <Typography fontWeight={600}>{estudiante.direccion || 'No especificado'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tutores */}
      <Paper elevation={0} sx={paperStyle}>
        <Box sx={sectionTitle}>
          <PeopleIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700}>
            Tutores / Padres de Familia ({tutores.length})
          </Typography>
        </Box>

        {tutores.map((tutor, index) => (
          <Box
            key={index}
            sx={{
              mb: 3,
              pb: 3,
              borderBottom: index < tutores.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Tutor #{index + 1}
              </Typography>
              {tutor.es_tutor_principal && <Chip label="Principal" size="small" color="primary" />}
            </Box>

            <Grid container spacing={2}>
              <Grid size={{xs:12, md:6}} >
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Nombre Completo
                </Typography>
                <Typography fontWeight={600}>
                  {tutor.nombres} {tutor.apellido_paterno} {tutor.apellido_materno}
                </Typography>
              </Grid>
              <Grid size={{xs:12, md:3}} >
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  CI
                </Typography>
                <Typography fontWeight={600}>{tutor.ci}</Typography>
              </Grid>
              <Grid size={{xs:12, md:3}} >
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Parentesco
                </Typography>
                <Typography fontWeight={600}>{tutor.parentesco || 'No especificado'}</Typography>
              </Grid>
            </Grid>
          </Box>
        ))}
      </Paper>

      {/* Usuarios */}
      {(crearUsuarioEstudiante || crearUsuariosTutores) && (
        <Paper elevation={0} sx={paperStyle}>
          <Box sx={sectionTitle}>
            <KeyIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700}>
              Usuarios a Crear
            </Typography>
          </Box>

          {crearUsuarioEstudiante && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px' }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Usuario del Estudiante
              </Typography>
              <Typography variant="body2">
                Username: {credencialesEstudiante.username || '(Se generará automáticamente)'}
              </Typography>
            </Box>
          )}

          {crearUsuariosTutores && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Usuarios de Tutores
              </Typography>
              {credencialesTutores.map((cred, index) => (
                <Box
                  key={index}
                  sx={{ mb: 1, p: 2, backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px' }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Tutor #{index + 1}: {tutores[index]?.nombres}
                  </Typography>
                  <Typography variant="caption">
                    Username: {cred.username || '(Se generará automáticamente)'}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      )}

      {/* Matrícula */}
      {incluirMatricula && (
        <Paper elevation={0} sx={paperStyle}>
          <Box sx={sectionTitle}>
            <SchoolIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700}>
              Matrícula
            </Typography>
          </Box>
          <Typography variant="body2">
            ✓ Se creará matrícula automáticamente
          </Typography>
        </Paper>
      )}

      {/* Documentos */}
      <Paper elevation={0} sx={paperStyle}>
        <Box sx={sectionTitle}>
          <UploadIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700}>
            Documentos Adjuntos ({documentos.length})
          </Typography>
        </Box>

        {documentos.length > 0 ? (
          <Grid container spacing={2}>
            {documentos.map((doc, index) => (
              <Grid size={{xs:12, md:6}} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid #10b981',
                  }}
                >
                  <CheckIcon sx={{ color: '#10b981' }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {doc.file.name}
                    </Typography>
                    <Typography variant="caption">
                      {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No se adjuntaron documentos
          </Typography>
        )}
      </Paper>
    </Box>
  );
};