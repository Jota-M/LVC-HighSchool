import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  Stack,
  CircularProgress,
  useTheme,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
  CheckCircleOutline as CheckIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { DocumentoMatricula, TipoDocumento } from '@/types/autoMatriculacionTypes';

interface DocumentosStepProps {
  documentos: DocumentoMatricula[];
  isMatriculando: boolean;
  onDocumentoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDocumentoTipoChange: (index: number, tipo: string) => void;
  onEliminarDocumento: (index: number) => void;
  onMatricular: () => void;
  onBack: () => void;
}

const tiposDocumento: { value: TipoDocumento; label: string }[] = [
  { value: 'certificado_nacimiento', label: 'Certificado de Nacimiento' },
  { value: 'fotocopia_ci', label: 'Fotocopia de CI' },
  { value: 'fotocopia_ci_tutor', label: 'Fotocopia CI Tutor' },
  { value: 'otro', label: 'Otro' },
];

export const DocumentosStep: React.FC<DocumentosStepProps> = ({
  documentos,
  isMatriculando,
  onDocumentoChange,
  onDocumentoTipoChange,
  onEliminarDocumento,
  onMatricular,
  onBack,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box>
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
        <UploadIcon
          sx={{
            fontSize: 38,
            color: isDark ? '#facc15' : '#0288d1',
            filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.4))',
          }}
        />
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            color: isDark ? '#facc15' : '#0288d1',
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          Documentos Requeridos
        </Typography>
      </Box>

      <Alert
        severity="info"
        sx={{
          mb: 4,
          borderRadius: '16px',
          border: '2px solid rgba(33, 150, 243, 0.3)',
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
            ✔️ Este paso es <strong>opcional</strong>, puedes continuar sin documentos
          </Typography>
        </Box>
      </Alert>

      <Button
        variant="outlined"
        component="label"
        fullWidth
        startIcon={<UploadIcon />}
        sx={{
          mb: 3,
          borderRadius: '12px',
          py: 1.5,
          borderWidth: '2px',
          borderColor: isDark ? 'rgba(250, 204, 21, 0.5)' : 'rgba(2, 136, 209, 0.5)',
          color: isDark ? '#facc15' : '#0288d1',
          fontWeight: 600,
          textTransform: 'none',
          '&:hover': {
            borderWidth: '2px',
            borderColor: isDark ? '#facc15' : '#0288d1',
            backgroundColor: isDark ? 'rgba(250, 204, 21, 0.05)' : 'rgba(2, 136, 209, 0.05)',
          },
        }}
        disabled={documentos.length >= 10}
      >
        {documentos.length >= 10 ? 'Límite de documentos alcanzado' : 'Seleccionar Documentos'}
        <input
          type="file"
          hidden
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={onDocumentoChange}
        />
      </Button>

      {documentos.length > 0 ? (
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
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                border: '2px solid #10b981',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckIcon sx={{ color: '#10b981', fontSize: 28 }} />
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {doc.file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                </Box>

                <IconButton
                  size="small"
                  onClick={() => onEliminarDocumento(index)}
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

              <FormControl fullWidth>
                <InputLabel>Tipo de Documento</InputLabel>
                <Select
                  value={doc.tipo_documento}
                  onChange={(e) => onDocumentoTipoChange(index, e.target.value)}
                  label="Tipo de Documento"
                  sx={{ borderRadius: '8px' }}
                >
                  {tiposDocumento.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          ))}
        </Box>
      ) : (
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
          <DocumentIcon
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
            Usa el botón de arriba para cargar documentos
          </Typography>
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button 
          onClick={onBack} 
          startIcon={<BackIcon />} 
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Atrás
        </Button>
        <Stack direction="row" spacing={2}>
          <Button
            onClick={onMatricular}
            disabled={isMatriculando}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Omitir Documentos
          </Button>
          <Button
            variant="contained"
            onClick={onMatricular}
            disabled={isMatriculando}
            startIcon={isMatriculando ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 4,
              fontWeight: 600,
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #0288d1 0%, #0277bd 100%)',
              color: isDark ? '#000' : '#fff',
            }}
          >
            {isMatriculando ? 'Procesando Matrícula...' : 'Confirmar Matrícula'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};