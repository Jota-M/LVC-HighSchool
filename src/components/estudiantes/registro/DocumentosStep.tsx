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
} from '@mui/material';
import {
  UploadFile as UploadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircleOutline as CheckIcon,
} from '@mui/icons-material';

interface Documento {
  file: File;
  tipo_documento: string;
  observaciones?: string;
}

interface DocumentosStepProps {
  documentos: Documento[];
  onChange: (documentos: Documento[]) => void;
}

const tiposDocumento = [
  { value: 'certificado_nacimiento', label: 'Certificado de Nacimiento' },
  { value: 'ci_estudiante', label: 'CI del Estudiante' },
  { value: 'ci_tutor', label: 'CI del Tutor/Padre' },
  { value: 'otro', label: 'Otro' },
];

export const DocumentosStep: React.FC<DocumentosStepProps> = ({ documentos, onChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, tipo: string) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange([
        ...documentos,
        {
          file,
          tipo_documento: tipo,
          observaciones: '',
        },
      ]);
    }
  };

  const handleObservacionesChange = (index: number, observaciones: string) => {
    const newDocs = [...documentos];
    newDocs[index] = { ...newDocs[index], observaciones };
    onChange(newDocs);
  };

  const eliminarDocumento = (index: number) => {
    onChange(documentos.filter((_, i) => i !== index));
  };

  const handlePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <UploadIcon sx={{ fontSize: 32, color: isDark ? '#facc15' : '#0288d1' }} />
        <Typography variant="h5" fontWeight={700}>
          Documentos Requeridos
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
          <Typography component="li" variant="body2">
            ✔️ Los documentos deben ser legibles y mostrar toda la información claramente
          </Typography>
        </Box>
      </Alert>

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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckIcon sx={{ color: '#10b981', fontSize: 28 }} />
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {tiposDocumento.find((t) => t.value === doc.tipo_documento)?.label || doc.tipo_documento}
                    </Typography>
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
            Usa los botones de arriba para cargar documentos
          </Typography>
        </Paper>
      )}
    </Box>
  );
};