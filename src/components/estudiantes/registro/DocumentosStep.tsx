// components/estudiantes/registro/DocumentosStep.tsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  Alert,
  useTheme,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import {
  UploadFile as UploadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircleOutline as CheckIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { Dayjs } from 'dayjs';

interface Documento {
  file: File;
  tipo_documento: string;
  observaciones?: string;
  estudiante_index?: number; // 🆕 Para modo múltiple
}

interface DocumentosStepProps {
  documentos: Documento[];
  onChange: (documentos: Documento[]) => void;
  modo?: string; // 🆕 Para saber si es múltiple
  estudiantes?: Array<{ // 🆕 Lista de estudiantes
    nombres: string;
    apellido_paterno: string;
    apellido_materno?: string;
  }>;
}

const tiposDocumento = [
  { value: 'certificado_nacimiento', label: 'Certificado de Nacimiento' },
  { value: 'ci_estudiante', label: 'CI del Estudiante' },
  { value: 'ci_tutor', label: 'CI del Tutor/Padre' },
  { value: 'libreta_escolar', label: 'Libreta Escolar' },
  { value: 'certificado_medico', label: 'Certificado Médico' },
  { value: 'otro', label: 'Otro' },
];

export const DocumentosStep: React.FC<DocumentosStepProps> = ({ 
  documentos, 
  onChange,
  modo = 'nuevo',
  estudiantes = [],
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const esMultiple = modo === 'multiple';
  const [estudianteSeleccionado, setEstudianteSeleccionado] = React.useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, tipo: string) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange([
        ...documentos,
        {
          file,
          tipo_documento: tipo,
          observaciones: '',
          estudiante_index: esMultiple ? estudianteSeleccionado : undefined,
        },
      ]);
      
      // Reset input para permitir subir el mismo archivo nuevamente
      e.target.value = '';
    }
  };

  const handleObservacionesChange = (index: number, observaciones: string) => {
    const newDocs = [...documentos];
    newDocs[index] = { ...newDocs[index], observaciones };
    onChange(newDocs);
  };

  const handleEstudianteChange = (docIndex: number, estudianteIndex: number) => {
    const newDocs = [...documentos];
    newDocs[docIndex] = { ...newDocs[docIndex], estudiante_index: estudianteIndex };
    onChange(newDocs);
  };

  const eliminarDocumento = (index: number) => {
    onChange(documentos.filter((_, i) => i !== index));
  };

  const handlePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  };

  const getEstudianteNombre = (index: number) => {
    const est = estudiantes[index];
    if (!est) return `Estudiante ${index + 1}`;
    return `${est.nombres} ${est.apellido_paterno}`;
  };

  // Agrupar documentos por estudiante (solo en modo múltiple)
  const documentosPorEstudiante = React.useMemo(() => {
    if (!esMultiple) return null;
    
    const grupos: { [key: number]: Documento[] } = {};
    documentos.forEach((doc) => {
      const idx = doc.estudiante_index ?? 0;
      if (!grupos[idx]) grupos[idx] = [];
      grupos[idx].push(doc);
    });
    return grupos;
  }, [documentos, esMultiple]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <UploadIcon sx={{ fontSize: 32, color: isDark ? '#facc15' : '#0288d1' }} />
        <Typography variant="h5" fontWeight={700}>
          Documentos {esMultiple ? '(Opcional por Estudiante)' : '(Opcional)'}
        </Typography>
      </Box>

      <Alert
        severity="info"
        sx={{
          mb: 4,
          borderRadius: '16px',
          border: '2px solid rgba(59, 130, 246, 0.3)',
        }}
      >
        <Typography fontWeight={600} sx={{ mb: 1 }}>
          📄 Instrucciones para la Carga de Documentos
        </Typography>
        <Box component="ul" sx={{ mt: 1, mb: 0, pl: 3 }}>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            ✔️ Asegúrate de que los documentos estén escaneados en buena calidad
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            ✔️ Formatos permitidos: PDF, JPG, PNG (máximo 10MB por archivo)
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            ✔️ Los documentos deben ser legibles y mostrar toda la información claramente
          </Typography>
          {esMultiple && (
            <Typography component="li" variant="body2" sx={{ color: '#f59e0b', fontWeight: 600 }}>
              ⚠️ Selecciona el estudiante ANTES de subir cada documento
            </Typography>
          )}
        </Box>
      </Alert>

      {/* Selector de estudiante (solo modo múltiple) */}
      {esMultiple && estudiantes.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: '16px',
            background: isDark 
              ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(2, 136, 209, 0.05) 0%, rgba(1, 87, 155, 0.05) 100%)',
            border: '2px solid',
            borderColor: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(2, 136, 209, 0.3)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <PersonIcon sx={{ color: isDark ? '#facc15' : '#0288d1' }} />
            <Typography variant="h6" fontWeight={600}>
              Selecciona el Estudiante
            </Typography>
          </Box>
          
          <FormControl fullWidth>
            <InputLabel>Documentos para</InputLabel>
            <Select
              value={estudianteSeleccionado}
              onChange={(e) => setEstudianteSeleccionado(Number(e.target.value))}
              label="Documentos para"
              sx={{
                borderRadius: '12px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(2, 136, 209, 0.3)',
                },
              }}
            >
              {estudiantes.map((est, idx) => (
                <MenuItem key={idx} value={idx}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip 
                      label={`#${idx + 1}`} 
                      size="small" 
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                    <Typography>
                      {est.nombres} {est.apellido_paterno} {est.apellido_materno || ''}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {esMultiple && documentosPorEstudiante && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ width: '100%', mb: 1 }}>
                Documentos por estudiante:
              </Typography>
              {estudiantes.map((_, idx) => {
                const count = documentosPorEstudiante[idx]?.length || 0;
                return (
                  <Chip
                    key={idx}
                    label={`${getEstudianteNombre(idx)}: ${count} doc${count !== 1 ? 's' : ''}`}
                    size="small"
                    color={count > 0 ? 'success' : 'default'}
                    variant={count > 0 ? 'filled' : 'outlined'}
                  />
                );
              })}
            </Box>
          )}
        </Paper>
      )}

      {/* Botones de carga */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        {tiposDocumento.map((tipo) => (
          <Button
            key={tipo.value}
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: isDark ? 'rgba(250, 204, 21, 0.5)' : 'rgba(2, 136, 209, 0.5)',
              color: isDark ? '#facc15' : '#0288d1',
              '&:hover': {
                borderColor: isDark ? '#facc15' : '#0288d1',
                backgroundColor: isDark ? 'rgba(250, 204, 21, 0.05)' : 'rgba(2, 136, 209, 0.05)',
              },
            }}
          >
            {tipo.label}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              hidden
              onChange={(e) => handleFileChange(e, tipo.value)}
            />
          </Button>
        ))}
      </Box>

      {/* Lista de documentos cargados */}
      {documentos.length > 0 && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Documentos Cargados ({documentos.length})
          </Typography>

          {documentos.map((doc, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: '12px',
                backgroundColor: isDark
                  ? 'rgba(16, 185, 129, 0.05)'
                  : 'rgba(16, 185, 129, 0.05)',
                border: '2px solid #10b981',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <CheckIcon sx={{ color: '#10b981', fontSize: 28 }} />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body1" fontWeight={600}>
                        {tiposDocumento.find((t) => t.value === doc.tipo_documento)?.label || doc.tipo_documento}
                      </Typography>
                      {esMultiple && doc.estudiante_index !== undefined && (
                        <Chip
                          label={getEstudianteNombre(doc.estudiante_index)}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {doc.file.name} ({(doc.file.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handlePreview(doc.file)}
                    sx={{
                      backgroundColor: isDark
                        ? 'rgba(2, 136, 209, 0.2)'
                        : 'rgba(2, 136, 209, 0.1)',
                      '&:hover': {
                        backgroundColor: '#0288d1',
                        color: '#fff',
                      },
                    }}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => eliminarDocumento(index)}
                    sx={{
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      '&:hover': {
                        backgroundColor: '#ef4444',
                        color: '#fff',
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Cambiar estudiante asignado (solo en modo múltiple) */}
              {esMultiple && estudiantes.length > 0 && (
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Asignar a</InputLabel>
                  <Select
                    value={doc.estudiante_index ?? 0}
                    onChange={(e) => handleEstudianteChange(index, Number(e.target.value))}
                    label="Asignar a"
                    sx={{ borderRadius: '8px' }}
                  >
                    {estudiantes.map((est, idx) => (
                      <MenuItem key={idx} value={idx}>
                        {getEstudianteNombre(idx)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <TextField
                fullWidth
                size="small"
                label="Observaciones"
                value={doc.observaciones || ''}
                onChange={(e) => handleObservacionesChange(index, e.target.value)}
                multiline
                rows={2}
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: '8px',
                  },
                }}
              />
            </Paper>
          ))}
        </Box>
      )}

      {documentos.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: '16px',
            border: '2px dashed',
            borderColor: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(2, 136, 209, 0.3)',
          }}
        >
          <UploadIcon
            sx={{
              fontSize: 64,
              color: isDark ? 'rgba(250, 204, 21, 0.5)' : 'rgba(2, 136, 209, 0.5)',
              mb: 2,
            }}
          />
          <Typography variant="body1" color="text.secondary">
            No se han cargado documentos aún
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {esMultiple 
              ? 'Selecciona un estudiante y usa los botones de arriba para cargar documentos'
              : 'Usa los botones de arriba para cargar documentos'
            }
          </Typography>
        </Paper>
      )}
    </Box>
  );
};