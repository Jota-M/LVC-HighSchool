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
  Alert,
} from '@mui/material';

import {
  Person as PersonIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  UploadFile as UploadIcon,
  VpnKey as KeyIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { Dayjs } from 'dayjs';
import {
  ModoRegistro,
  PadreEncontrado,
  CredencialesUsuario,
  MatriculaCreate,
  EstudianteCreate,
  TutorCreate,
} from '@/types/estudianteTypes';

// Tipos con Dayjs para el formulario
type EstudianteFormData = Omit<EstudianteCreate, 'fecha_nacimiento'> & {
  fecha_nacimiento: Dayjs | null;
};

type TutorFormData = Omit<TutorCreate, 'fecha_nacimiento'> & {
  fecha_nacimiento: Dayjs | null;
};

interface ConfirmacionStepProps {
  modo: ModoRegistro;
  estudiantes: EstudianteFormData[];
  fotos: (File | null)[];
  tutores: TutorFormData[];
  padreExistente: PadreEncontrado | null;
  crearUsuarioEstudiante: boolean;
  crearUsuariosTutores: boolean;
  credencialesEstudiantes: CredencialesUsuario[];
  credencialesTutores: CredencialesUsuario[];
  incluirMatricula: boolean;
  matriculas: MatriculaCreate[];
  documentos: any[];
}

export const ConfirmacionStep: React.FC<ConfirmacionStepProps> = ({
  modo,
  estudiantes,
  fotos,
  tutores,
  padreExistente,
  crearUsuarioEstudiante,
  crearUsuariosTutores,
  credencialesEstudiantes,
  credencialesTutores,
  incluirMatricula,
  matriculas,
  documentos,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const esMultiple = modo === 'multiple';
  const esExistente = modo === 'existente';

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
        <Chip
          label={`Modo: ${modo.toUpperCase()}`}
          color="primary"
          sx={{ mt: 2, fontWeight: 700, fontSize: '0.9rem' }}
        />
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Estudiantes */}
      <Paper elevation={0} sx={paperStyle}>
        <Box sx={sectionTitle}>
          <PersonIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700}>
            Estudiante{esMultiple ? 's' : ''} ({estudiantes.length})
          </Typography>
        </Box>

        {estudiantes.map((estudiante, index) => (
          <Box
            key={index}
            sx={{
              mb: index < estudiantes.length - 1 ? 3 : 0,
              pb: index < estudiantes.length - 1 ? 3 : 0,
              borderBottom: index < estudiantes.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
            }}
          >
            {esMultiple && (
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Estudiante #{index + 1}
              </Typography>
            )}

            {fotos[index] && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Avatar
                  src={URL.createObjectURL(fotos[index]!)}
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
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Nombre Completo
                </Typography>
                <Typography fontWeight={600}>
                  {estudiante.nombres} {estudiante.apellido_paterno} {estudiante.apellido_materno}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  CI
                </Typography>
                <Typography fontWeight={600}>{estudiante.ci || 'No especificado'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Fecha de Nacimiento
                </Typography>
                <Typography fontWeight={600}>
                  {estudiante.fecha_nacimiento ? estudiante.fecha_nacimiento.format('DD/MM/YYYY') : 'No especificado'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Género
                </Typography>
                <Typography fontWeight={600}>{estudiante.genero || 'No especificado'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 9 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Dirección
                </Typography>
                <Typography fontWeight={600}>{estudiante.direccion || 'No especificado'}</Typography>
              </Grid>
            </Grid>
          </Box>
        ))}
      </Paper>

      {/* Tutores */}
      <Paper elevation={0} sx={paperStyle}>
        <Box sx={sectionTitle}>
          <PeopleIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700}>
            {esExistente ? 'Tutor/Padre (Existente)' : `Tutores / Padres de Familia (${tutores.length})`}
          </Typography>
        </Box>

        {esExistente && padreExistente ? (
          // MODO EXISTENTE: mostrar padre existente
          <Box
            sx={{
              p: 3,
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.05)',
              borderRadius: '12px',
              border: '1px solid #10b981',
            }}
          >
            <Chip label="Padre Existente" color="success" size="small" sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Nombre Completo
                </Typography>
                <Typography fontWeight={600}>
                  {padreExistente.nombres} {padreExistente.apellido_paterno} {padreExistente.apellido_materno}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  CI
                </Typography>
                <Typography fontWeight={600}>{padreExistente.ci}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Teléfono
                </Typography>
                <Typography fontWeight={600}>{padreExistente.telefono || 'No especificado'}</Typography>
              </Grid>
            </Grid>

            {padreExistente.hijos && padreExistente.hijos.length > 0 && (
              <Box mt={2}>
                <Typography variant="body2" fontWeight={600} mb={1}>
                  Otros hijos matriculados:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {padreExistente.hijos.map((hijo) => (
                    <Chip
                      key={hijo.id}
                      label={`${hijo.nombres} ${hijo.apellido_paterno}`}
                      size="small"
                      variant="outlined"
                      color="success"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          // MODO NUEVO/MULTIPLE: mostrar tutores nuevos
          tutores.map((tutor, index) => (
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
                {index === 0 && <Chip label="Principal" size="small" color="primary" />}
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Nombre Completo
                  </Typography>
                  <Typography fontWeight={600}>
                    {tutor.nombres} {tutor.apellido_paterno} {tutor.apellido_materno}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    CI
                  </Typography>
                  <Typography fontWeight={600}>{tutor.ci}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Parentesco
                  </Typography>
                  <Typography fontWeight={600}>{tutor.parentesco || 'No especificado'}</Typography>
                </Grid>
              </Grid>
            </Box>
          ))
        )}
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
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} mb={2}>
                Usuario{esMultiple ? 's' : ''} de Estudiante{esMultiple ? 's' : ''}
              </Typography>
              {estudiantes.map((est, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    p: 2,
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid #10b981',
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {esMultiple && `#${index + 1} - `}
                    {est.nombres} {est.apellido_paterno}
                  </Typography>
                  <Typography variant="caption">
                    Username:{' '}
                    {credencialesEstudiantes[index]?.username || '(Se generará automáticamente)'}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {crearUsuariosTutores && !esExistente && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} mb={2}>
                Usuarios de Tutores
              </Typography>
              {tutores.map((tutor, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 1,
                    p: 2,
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Tutor #{index + 1}: {tutor.nombres} {tutor.apellido_paterno}
                  </Typography>
                  <Typography variant="caption">
                    Username: {credencialesTutores[index]?.username || '(Se generará automáticamente)'}
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
              Matrícula{esMultiple ? 's' : ''}
            </Typography>
          </Box>
          <Alert severity="success" icon={<CheckIcon />}>
            <Typography variant="body2">
              ✓ Se {esMultiple ? 'crearán' : 'creará'} {esMultiple ? matriculas.length : '1'} matrícula
              {esMultiple ? 's' : ''} automáticamente
            </Typography>
          </Alert>
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
              <Grid size={{ xs: 12, md: 6 }} key={index}>
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
                    <Typography variant="caption">{(doc.file.size / 1024 / 1024).toFixed(2)} MB</Typography>
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

      {/* Alert final */}
      <Alert
        severity="info"
        icon={<InfoIcon />}
        sx={{
          borderRadius: '16px',
          border: '2px solid rgba(59, 130, 246, 0.3)',
        }}
      >
        <Typography variant="body2">
          <strong>📋 Resumen:</strong> Se {esMultiple ? 'registrarán' : 'registrará'}{' '}
          <strong>{estudiantes.length}</strong> estudiante{esMultiple ? 's' : ''},{' '}
          <strong>{esExistente ? '0' : tutores.length}</strong> tutor{!esExistente && tutores.length > 1 ? 'es' : ''}{' '}
          nuevo{!esExistente && tutores.length > 1 ? 's' : ''}, y{' '}
          <strong>{incluirMatricula ? (esMultiple ? matriculas.length : '1') : '0'}</strong> matrícula
          {esMultiple && incluirMatricula ? 's' : ''}.
        </Typography>
      </Alert>
    </Box>
  );
};