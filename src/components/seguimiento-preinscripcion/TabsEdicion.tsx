import { useState } from 'react';
import { Paper, Tabs, Tab, Box, useTheme } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
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

  return (
    <Paper
      elevation={8}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(1, 87, 155, 0.1)',
      }}
    >
      <Tabs
        value={tabActual}
        onChange={(_, newValue) => setTabActual(newValue)}
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(2, 136, 209, 0.02)',
          '& .MuiTab-root': {
            fontWeight: 600,
            fontSize: '1rem',
            py: 2,
            textTransform: 'none',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(1, 87, 155, 0.6)',
            '&.Mui-selected': {
              color: isDark ? '#facc15' : '#0288d1',
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: isDark ? '#facc15' : '#0288d1',
            height: 3,
          },
        }}
      >
        <Tab icon={<PersonIcon />} label="Datos del Estudiante" iconPosition="start" />
        <Tab icon={<PeopleIcon />} label="Datos del Tutor" iconPosition="start" />
        <Tab icon={<DescriptionIcon />} label="Documentos" iconPosition="start" />
      </Tabs>

      <Box sx={{ p: 4 }}>
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