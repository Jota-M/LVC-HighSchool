// components/estudiantes/registro/MatriculaStep.tsx
import React from 'react';
import {
  Box,
  Typography,
  useTheme,
  Paper,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import { School as SchoolIcon, Info as InfoIcon } from '@mui/icons-material';
import { MatriculaSelectors } from '@/components/estudiantes/MatriculaSelectors';
import { ModoRegistro, MatriculaCreate, EstudianteCreate } from '@/types/estudianteTypes';
import { Dayjs } from 'dayjs';

// Tipo con Dayjs para el formulario
type EstudianteFormData = Omit<EstudianteCreate, 'fecha_nacimiento'> & {
  fecha_nacimiento: Dayjs | null;
};

interface MatriculaStepProps {
  modo: ModoRegistro;
  incluirMatricula: boolean;
  matriculas: MatriculaCreate[];
  estudiantes: EstudianteFormData[];
  onToggleIncluir: (incluir: boolean) => void;
  onMatriculasChange: (matriculas: MatriculaCreate[]) => void;
}

export const MatriculaStep: React.FC<MatriculaStepProps> = ({
  modo,
  incluirMatricula,
  matriculas,
  estudiantes,
  onToggleIncluir,
  onMatriculasChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const esMultiple = modo === 'multiple';

  // Sincronizar cantidad de matrículas con estudiantes
  React.useEffect(() => {
    if (esMultiple && incluirMatricula) {
      if (matriculas.length < estudiantes.length) {
        const nuevas = Array(estudiantes.length - matriculas.length)
          .fill(null)
          .map(() => ({
            paralelo_id: 0,
            periodo_academico_id: 0,
            numero_matricula: '',
            es_repitente: false,
            es_becado: false,
            porcentaje_beca: 0,
            tipo_beca: '',
            observaciones: '',
          }));
        onMatriculasChange([...matriculas, ...nuevas]);
      } else if (matriculas.length > estudiantes.length) {
        onMatriculasChange(matriculas.slice(0, estudiantes.length));
      }
    } else if (!esMultiple && matriculas.length === 0) {
      // Modo simple: inicializar con una matrícula vacía
      onMatriculasChange([{
        paralelo_id: 0,
        periodo_academico_id: 0,
        numero_matricula: '',
        es_repitente: false,
        es_becado: false,
        porcentaje_beca: 0,
        tipo_beca: '',
        observaciones: '',
      }]);
    }
  }, [estudiantes.length, esMultiple, incluirMatricula]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <SchoolIcon sx={{ fontSize: 32, color: isDark ? '#facc15' : '#0288d1' }} />
        <Typography variant="h5" fontWeight={700}>
          Matrícula{esMultiple ? 's' : ''} (Opcional)
        </Typography>
      </Box>

      {esMultiple ? (
        // MODO MÚLTIPLE: Un MatriculaSelectors por cada estudiante
        <>
          {/* Toggle global */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: '16px',
              border: '2px solid',
              borderColor: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(2, 136, 209, 0.3)',
              backgroundColor: isDark ? 'rgba(250, 204, 21, 0.05)' : 'rgba(2, 136, 209, 0.05)',
            }}
          >
            <FormControlLabel
              control={
                <Switch 
                  checked={incluirMatricula} 
                  onChange={(e) => onToggleIncluir(e.target.checked)} 
                />
              }
              label={
                <Typography fontWeight={700} sx={{ fontSize: '1.1rem', color: isDark ? '#facc15' : '#0288d1' }}>
                  Incluir matrículas en el registro
                </Typography>
              }
            />
            <Typography variant="body2" sx={{ mt: 1, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(1,87,155,0.7)' }}>
              Si no incluyes las matrículas ahora, deberás hacerlo después desde el módulo de matrículas.
            </Typography>
          </Paper>

          {incluirMatricula && estudiantes.map((est, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: '16px',
                border: '2px solid',
                borderColor: isDark ? 'rgba(250, 204, 21, 0.15)' : 'rgba(2, 136, 209, 0.15)',
                backgroundColor: isDark ? 'rgba(250, 204, 21, 0.03)' : 'rgba(2, 136, 209, 0.03)',
              }}
            >
              <Typography 
                variant="h6" 
                fontWeight={600} 
                mb={3} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: isDark ? '#facc15' : '#0288d1',
                }}
              >
                <SchoolIcon />
                Matrícula #{index + 1}: {est.nombres || 'Sin nombre'} {est.apellido_paterno || ''}
              </Typography>

              {/* Reutilizar MatriculaSelectors - MANTIENE TODA LA LÓGICA */}
              <MatriculaSelectors
                value={matriculas[index] || {
                  paralelo_id: 0,
                  periodo_academico_id: 0,
                  numero_matricula: '',
                  es_repitente: false,
                  es_becado: false,
                  porcentaje_beca: 0,
                  tipo_beca: '',
                  observaciones: '',
                }}
                onChange={(data) => {
                  const newMatriculas = [...matriculas];
                  newMatriculas[index] = { 
                    ...newMatriculas[index], 
                    ...data 
                  };
                  onMatriculasChange(newMatriculas);
                }}
                incluirMatricula={true} // Siempre true aquí, el toggle está arriba
                onToggleIncluir={() => {}} // No hace nada, el toggle es global
                hideToggle={true} // Ocultar el toggle interno
              />
            </Paper>
          ))}
        </>
      ) : (
        // MODO SIMPLE: Un solo MatriculaSelectors
        <MatriculaSelectors
          value={matriculas[0] || {
            paralelo_id: 0,
            periodo_academico_id: 0,
            numero_matricula: '',
            es_repitente: false,
            es_becado: false,
            porcentaje_beca: 0,
            tipo_beca: '',
            observaciones: '',
          }}
          onChange={(data) => {
            onMatriculasChange([{ ...matriculas[0], ...data }]);
          }}
          incluirMatricula={incluirMatricula}
          onToggleIncluir={onToggleIncluir}
          hideToggle={false} // Mostrar el toggle en modo simple
        />
      )}

      <Alert
        severity="info"
        icon={<InfoIcon />}
        sx={{
          mt: 3,
          borderRadius: '16px',
          border: '2px solid rgba(59, 130, 246, 0.3)',
        }}
      >
        <Typography variant="body2">
          <strong>ℹ️ Información:</strong> Si activas esta opción,{' '}
          {esMultiple ? 'los estudiantes serán matriculados' : 'el estudiante será matriculado'}{' '}
          automáticamente en {esMultiple ? 'los paralelos seleccionados' : 'el paralelo seleccionado'}.
        </Typography>
      </Alert>
    </Box>
  );
};