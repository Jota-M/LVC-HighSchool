// components/matriculacion/ConfirmacionMatriculaStep.tsx
import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Alert,
  Divider,
  Chip,
  useTheme,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  AttachFile as AttachIcon,
} from '@mui/icons-material';
import { Estudiante, PeriodoAcademico, Paralelo } from '@/types/estudianteTypes';

interface DocumentoForm {
  tipo_documento: string;
  file: File | null;
  observaciones: string;
}

interface ConfirmacionMatriculaStepProps {
  estudiante: Estudiante;
  formData: {
    periodo_academico_id: number | null;
    paralelo_id: number | null;
    es_repitente: boolean;
    es_becado: boolean;
    porcentaje_beca: number | null;
    tipo_beca: string;
    observaciones: string;
  };
  periodos: PeriodoAcademico[];
  paralelosDisponibles: Paralelo[];
  documentos: DocumentoForm[];
}

export const ConfirmacionMatriculaStep: React.FC<ConfirmacionMatriculaStepProps> = ({
  estudiante,
  formData,
  periodos,
  paralelosDisponibles,
  documentos,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const periodoSeleccionado = periodos.find(
    (p) => p.id === formData.periodo_academico_id
  );
  const paraleloSeleccionado = paralelosDisponibles.find(
    (p) => p.id === formData.paralelo_id
  );

  const documentosConArchivo = documentos.filter((d) => d.file);

  const InfoCard = ({
    icon,
    title,
    children,
  }: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
  }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '16px',
        border: '2px solid',
        borderColor: isDark
          ? 'rgba(250, 204, 21, 0.2)'
          : 'rgba(2, 136, 209, 0.2)',
        background: isDark
          ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.05) 0%, rgba(251, 191, 36, 0.05) 100%)'
          : 'linear-gradient(135deg, rgba(2, 136, 209, 0.05) 0%, rgba(1, 87, 155, 0.05) 100%)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {icon}
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  );

  const InfoRow = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.3 }}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 4,
          p: 2,
          borderRadius: 3,
          background: isDark
            ? 'rgba(250, 204, 21, 0.08)'
            : 'rgba(2, 136, 209, 0.08)',
        }}
      >
        <CheckIcon
          sx={{
            fontSize: 38,
            color: isDark ? '#facc15' : '#0288d1',
            filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.4))',
          }}
        />
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{
            color: isDark ? '#facc15' : '#0288d1',
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          Confirmación de Matrícula
        </Typography>
      </Box>

      {/* Alert de confirmación */}
      <Alert
        severity="info"
        icon={<CheckIcon />}
        sx={{
          mb: 4,
          borderRadius: '16px',
          border: '2px solid rgba(59, 130, 246, 0.3)',
        }}
      >
        <Typography fontWeight={600} sx={{ mb: 0.5 }}>
          Por favor, revisa todos los datos antes de confirmar
        </Typography>
        <Typography variant="body2">
          Una vez confirmada la matrícula, se generará el registro oficial del estudiante en el
          sistema.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Información del Estudiante */}
        <Grid size={{xs:12, md:6}}>
          <InfoCard
            icon={
              <SchoolIcon
                sx={{
                  fontSize: 28,
                  color: isDark ? '#facc15' : '#0288d1',
                }}
              />
            }
            title="Estudiante"
          >
            <InfoRow
              label="Nombre Completo"
              value={`${estudiante.nombres} ${estudiante.apellido_paterno} ${
                estudiante.apellido_materno || ''
              }`}
            />
            <InfoRow label="Código" value={estudiante.codigo} />
            {estudiante.ci && <InfoRow label="CI" value={estudiante.ci} />}
          </InfoCard>
        </Grid>

        {/* Información del Periodo */}
        <Grid size={{xs:12, md:6}}>
          <InfoCard
            icon={
              <CalendarIcon
                sx={{
                  fontSize: 28,
                  color: isDark ? '#facc15' : '#0288d1',
                }}
              />
            }
            title="Periodo Académico"
          >
            <InfoRow
              label="Periodo"
              value={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {periodoSeleccionado?.nombre}
                  {periodoSeleccionado?.activo && (
                    <Chip label="ACTIVO" size="small" color="success" />
                  )}
                </Box>
              }
            />
            {periodoSeleccionado && (
              <>
                <InfoRow
                  label="Fecha de Inicio"
                  value={new Date(periodoSeleccionado.fecha_inicio).toLocaleDateString('es-ES')}
                />
                <InfoRow
                  label="Fecha de Fin"
                  value={new Date(periodoSeleccionado.fecha_fin).toLocaleDateString('es-ES')}
                />
              </>
            )}
          </InfoCard>
        </Grid>

        {/* Información del Paralelo */}
        <Grid size={{xs:12, md:6}}>
          <InfoCard
            icon={
              <PeopleIcon
                sx={{
                  fontSize: 28,
                  color: isDark ? '#facc15' : '#0288d1',
                }}
              />
            }
            title="Paralelo Asignado"
          >
            {paraleloSeleccionado && (
              <>
                <InfoRow label="Grado" value={paraleloSeleccionado.grado_nombre} />
                <InfoRow label="Paralelo" value={paraleloSeleccionado.nombre} />
                <InfoRow label="Turno" value={paraleloSeleccionado.turno_nombre} />
                <InfoRow
                  label="Estado"
                  value={
                    formData.es_repitente ? (
                      <Chip label="REPITENTE" size="small" color="warning" />
                    ) : (
                      <Chip label="REGULAR" size="small" color="success" />
                    )
                  }
                />
              </>
            )}
          </InfoCard>
        </Grid>

        {/* Información de Beca */}
        <Grid size={{xs:12, md:6}}>
          <InfoCard
            icon={
              <TrophyIcon
                sx={{
                  fontSize: 28,
                  color: isDark ? '#facc15' : '#0288d1',
                }}
              />
            }
            title="Información de Beca"
          >
            {formData.es_becado ? (
              <>
                <InfoRow
                  label="Estado de Beca"
                  value={
                    <Chip
                      label="BECADO"
                      size="small"
                      sx={{
                        backgroundColor: '#10b981',
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    />
                  }
                />
                <InfoRow label="Porcentaje" value={`${formData.porcentaje_beca}%`} />
                <InfoRow label="Tipo de Beca" value={formData.tipo_beca || 'No especificado'} />
              </>
            ) : (
              <Box
                sx={{
                  py: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  El estudiante no cuenta con beca
                </Typography>
              </Box>
            )}
          </InfoCard>
        </Grid>

        {/* Documentos Adjuntos */}
        <Grid size={{xs:12}}>
          <InfoCard
            icon={
              <AttachIcon
                sx={{
                  fontSize: 28,
                  color: isDark ? '#facc15' : '#0288d1',
                }}
              />
            }
            title="Documentos Adjuntos"
          >
            {documentosConArchivo.length > 0 ? (
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                  {documentosConArchivo.length} documento(s) adjunto(s)
                </Typography>
                {documentosConArchivo.map((doc, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      mb: 1,
                      borderRadius: '8px',
                      backgroundColor: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {doc.tipo_documento.replace(/_/g, ' ').toUpperCase()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {doc.file?.name} ({(doc.file!.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                    {doc.observaciones && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        Observaciones: {doc.observaciones}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  py: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No se adjuntaron documentos
                </Typography>
              </Box>
            )}
          </InfoCard>
        </Grid>

        {/* Observaciones */}
        {formData.observaciones && (
          <Grid size={{xs:12}}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '2px solid',
                borderColor: isDark
                  ? 'rgba(250, 204, 21, 0.2)'
                  : 'rgba(2, 136, 209, 0.2)',
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Observaciones
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.observaciones}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};