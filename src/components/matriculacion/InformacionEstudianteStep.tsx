// components/matriculacion/InformacionEstudianteStep.tsx
import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Grid,
  Divider,
  Alert,
  useTheme,
} from '@mui/material';
import { Person as PersonIcon, School as SchoolIcon } from '@mui/icons-material';
import { Estudiante } from '@/types/estudianteTypes';

interface InformacionEstudianteStepProps {
  estudiante: Estudiante;
}

export const InformacionEstudianteStep: React.FC<InformacionEstudianteStepProps> = ({
  estudiante,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
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
        <PersonIcon
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
          Información del Estudiante
        </Typography>
      </Box>

      {/* Alert de matrícula previa */}
      {estudiante.matriculas && estudiante.matriculas.length > 0 ? (
        <Alert
          severity="info"
          icon={<SchoolIcon />}
          sx={{
            mb: 3,
            borderRadius: '12px',
            border: '2px solid rgba(59, 130, 246, 0.3)',
          }}
        >
          <Typography fontWeight={600}>Última Matrícula</Typography>
          <Typography variant="body2">
            {estudiante.matriculas[estudiante.matriculas.length - 1].grado} -{' '}
            {estudiante.matriculas[estudiante.matriculas.length - 1].periodo}
          </Typography>
        </Alert>
      ) : (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
            borderRadius: '12px',
            border: '2px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          <Typography fontWeight={600}>Sin matrículas previas registradas</Typography>
          <Typography variant="body2">
            Este será el primer registro de matrícula para el estudiante
          </Typography>
        </Alert>
      )}

      {/* Avatar y datos principales */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          mb: 4,
          p: 3,
          borderRadius: '16px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.05) 0%, rgba(251, 191, 36, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(2, 136, 209, 0.05) 0%, rgba(1, 87, 155, 0.05) 100%)',
          border: '2px solid',
          borderColor: isDark
            ? 'rgba(250, 204, 21, 0.2)'
            : 'rgba(2, 136, 209, 0.2)',
        }}
      >
        <Avatar
          src={estudiante.foto_url || undefined}
          sx={{
            width: 100,
            height: 100,
            border: '4px solid',
            borderColor: isDark ? '#facc15' : '#0288d1',
            fontSize: '2rem',
            fontWeight: 700,
            background: isDark
              ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
              : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
          }}
        >
          {estudiante.nombres.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {estudiante.nombres} {estudiante.apellido_paterno}{' '}
            {estudiante.apellido_materno}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`Código: ${estudiante.codigo}`}
              size="small"
              sx={{
                fontWeight: 600,
                backgroundColor: isDark
                  ? 'rgba(250, 204, 21, 0.15)'
                  : 'rgba(2, 136, 209, 0.15)',
                color: isDark ? '#facc15' : '#0288d1',
              }}
            />
            {estudiante.ci && (
              <Chip
                label={`CI: ${estudiante.ci}`}
                size="small"
                sx={{
                  fontWeight: 600,
                  backgroundColor: isDark
                    ? 'rgba(250, 204, 21, 0.15)'
                    : 'rgba(2, 136, 209, 0.15)',
                  color: isDark ? '#facc15' : '#0288d1',
                }}
              />
            )}
            <Chip
              label={estudiante.activo ? 'Activo' : 'Inactivo'}
              size="small"
              color={estudiante.activo ? 'success' : 'default'}
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Información detallada */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
        Información Personal
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoItem
            label="Fecha de Nacimiento"
            value={new Date(estudiante.fecha_nacimiento).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoItem
            label="Género"
            value={
              estudiante.genero
                ? estudiante.genero.charAt(0).toUpperCase() + estudiante.genero.slice(1)
                : 'No especificado'
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoItem
            label="Teléfono"
            value={estudiante.telefono || 'No registrado'}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoItem label="Email" value={estudiante.email || 'No registrado'} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <InfoItem
            label="Dirección"
            value={estudiante.direccion || 'No registrada'}
          />
        </Grid>
        {estudiante.zona && (
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoItem label="Zona" value={estudiante.zona} />
          </Grid>
        )}
        {estudiante.ciudad && (
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoItem label="Ciudad" value={estudiante.ciudad} />
          </Grid>
        )}
      </Grid>

      {/* Contacto de emergencia */}
      {(estudiante.contacto_emergencia || estudiante.telefono_emergencia) && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Contacto de Emergencia
          </Typography>
          <Grid container spacing={3}>
            {estudiante.contacto_emergencia && (
              <Grid size={{ xs: 12, md: 6 }}>
                <InfoItem
                  label="Nombre"
                  value={estudiante.contacto_emergencia}
                />
              </Grid>
            )}
            {estudiante.telefono_emergencia && (
              <Grid size={{ xs: 12, md: 6 }}>
                <InfoItem
                  label="Teléfono"
                  value={estudiante.telefono_emergencia}
                />
              </Grid>
            )}
          </Grid>
        </>
      )}


      {/* Observaciones */}
      {estudiante.observaciones && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Observaciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {estudiante.observaciones}
          </Typography>
        </>
      )}
    </Box>
  );
};