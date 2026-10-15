import React, { useState } from 'react';
import { Paper, Tabs, Tab, Box, useTheme, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { PreInscripcionDetalle } from '@/types/preinscripcionTypes';
import { DatosEstudianteEditable } from './DatosEstudianteEditable';
import { DatosTutorEditable } from './DatosTutorEditable';
import { DocumentosEditables } from './DocumentosEditables';

interface TabsEdicionProps {
  preinscripcion: PreInscripcionDetalle;
  onActualizarEstudiante: (datos: any) => Promise<{ success: boolean; error?: string }>;
  onActualizarTutor: (datos: any) => Promise<{ success: boolean; error?: string }>;
  onResubirDocumento: (tipo: string, archivo: File) => Promise<{ success: boolean; error?: string }>;
  guardando: boolean;
}

export const TabsEdicion: React.FC<TabsEdicionProps> = ({
  preinscripcion,
  onActualizarEstudiante,
  onActualizarTutor,
  onResubirDocumento,
  guardando,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [tabActual, setTabActual] = useState(0);

  const paperStyle = {
    borderRadius: '24px',
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(1, 87, 155, 0.12)',
    boxShadow: isDark
      ? '0 20px 60px rgba(0, 0, 0, 0.5)'
      : '0 20px 60px rgba(1, 87, 155, 0.1)',
    overflow: 'hidden',
  };

  return (
    <Paper elevation={0} sx={paperStyle}>
      <Box sx={{ p: { xs: 2.5, md: 3 }, pb: 1, borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <EditNoteIcon sx={{ color: isDark ? '#facc15' : '#01579b', fontSize: 26 }} />
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              color: isDark ? '#ffffff' : '#0f172a',
            }}
          >
            Actualización y Subsanación de Información
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
            display: 'block',
            mt: 0.5,
          }}
        >
          Puedes modificar datos del estudiante, tutor o volver a subir documentos observados
        </Typography>
      </Box>

      <Tabs
        value={tabActual}
        onChange={(_, newValue) => setTabActual(newValue)}
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(2, 136, 209, 0.03)',
          '& .MuiTab-root': {
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: { xs: '0.8rem', sm: '0.95rem' },
            py: 2,
            textTransform: 'none',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(1, 87, 155, 0.6)',
            '&.Mui-selected': {
              color: isDark ? '#facc15' : '#01579b',
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: isDark ? '#facc15' : '#01579b',
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        }}
      >
        <Tab icon={<PersonIcon sx={{ fontSize: 20 }} />} label="Estudiante" iconPosition="start" />
        <Tab icon={<PeopleIcon sx={{ fontSize: 20 }} />} label="Tutor Responsable" iconPosition="start" />
        <Tab icon={<DescriptionIcon sx={{ fontSize: 20 }} />} label="Documentos" iconPosition="start" />
      </Tabs>

      <Box sx={{ p: { xs: 2.5, md: 4 } }}>
        {tabActual === 0 && (
          <DatosEstudianteEditable
            estudiante={preinscripcion.estudiante}
            onGuardar={onActualizarEstudiante}
            guardando={guardando}
          />
        )}
        {tabActual === 1 && (
          <DatosTutorEditable
            tutor={preinscripcion.tutor}
            onGuardar={onActualizarTutor}
            guardando={guardando}
          />
        )}
        {tabActual === 2 && (
          <DocumentosEditables
            documentos={preinscripcion.documentos}
            onResubir={onResubirDocumento}
            guardando={guardando}
          />
        )}
      </Box>
    </Paper>
  );
};