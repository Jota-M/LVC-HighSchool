// components/matriculacion/DocumentosMatriculaStep.tsx
import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Alert,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Paper,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  CheckCircleOutline as CheckIcon,
} from '@mui/icons-material';
import { TIPOS_DOCUMENTO_MATRICULA } from '@/types/matriculacionTypes';

interface DocumentoForm {
  tipo_documento: string;
  file: File | null;
  observaciones: string;
}

interface DocumentosMatriculaStepProps {
  documentos: DocumentoForm[];
  onAgregarDocumento: () => void;
  onEliminarDocumento: (index: number) => void;
  onActualizarDocumento: (index: number, field: keyof DocumentoForm, value: any) => void;
}

export const DocumentosMatriculaStep: React.FC<DocumentosMatriculaStepProps> = ({
  documentos,
  onAgregarDocumento,
  onEliminarDocumento,
  onActualizarDocumento,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const fieldStyle = {
    '& .MuiInputLabel-root': {
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      fontWeight: 500,
      '&.Mui-focused': {
        color: isDark ? '#facc15' : '#0288d1',
      },
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      transition: '0.2s ease',
      '&:hover fieldset': {
        borderColor: isDark ? '#facc15' : '#0288d1',
      },
      '&.Mui-focused fieldset': {
        borderColor: isDark ? '#facc15' : '#0288d1',
      },
    },
  };

  const handleAgregarDocumento = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onAgregarDocumento();
  };

  const handleEliminarDocumento = (index: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onEliminarDocumento(index);
  };

  const handleFileClick = (index: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const fileInput = document.getElementById(`file-input-${index}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleFileChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      onActualizarDocumento(index, 'file', file);
      e.target.value = '';
    }
  };

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
        <UploadIcon
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
          Documentos de Matrícula
        </Typography>
      </Box>

      {/* Instrucciones */}
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
            ✔️ Los documentos son opcionales, puedes adjuntarlos ahora o después
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            ✔️ Formatos permitidos: PDF, JPG, PNG (máximo 10MB por archivo)
          </Typography>
          <Typography component="li" variant="body2">
            ✔️ Asegúrate de que los documentos estén legibles y en buena calidad
          </Typography>
        </Box>
      </Alert>

      {/* Botón agregar documento */}
      <Button
        variant="outlined"
        startIcon={<UploadIcon />}
        onClick={handleAgregarDocumento}
        sx={{
          mb: 3,
          textTransform: 'none',
          borderRadius: '12px',
          fontWeight: 600,
          borderColor: isDark ? 'rgba(250, 204, 21, 0.5)' : 'rgba(2, 136, 209, 0.5)',
          color: isDark ? '#facc15' : '#0288d1',
          '&:hover': {
            borderColor: isDark ? '#facc15' : '#0288d1',
            backgroundColor: isDark
              ? 'rgba(250, 204, 21, 0.05)'
              : 'rgba(2, 136, 209, 0.05)',
          },
        }}
      >
        Agregar Documento
      </Button>

      {/* Lista de documentos */}
      {documentos.length > 0 ? (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Documentos Agregados ({documentos.length})
          </Typography>

          {documentos.map((doc, index) => (
            <Card
              key={index}
              elevation={0}
              sx={{
                mb: 2,
                borderRadius: '16px',
                border: '2px solid',
                borderColor: doc.file
                  ? 'rgba(16, 185, 129, 0.3)'
                  : isDark
                  ? 'rgba(250, 204, 21, 0.2)'
                  : 'rgba(2, 136, 209, 0.2)',
                backgroundColor: doc.file
                  ? 'rgba(16, 185, 129, 0.05)'
                  : isDark
                  ? 'rgba(15, 23, 42, 0.5)'
                  : 'rgba(255, 255, 255, 0.5)',
              }}
            >
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  {/* Icono de estado */}
                  <Grid size={{ xs: 12, sm: "auto" }}>
                    {doc.file ? (
                      <CheckIcon
                        sx={{
                          color: '#10b981',
                          fontSize: 32,
                        }}
                      />
                    ) : (
                      <FileIcon
                        sx={{
                          color: isDark ? '#facc15' : '#0288d1',
                          fontSize: 32,
                        }}
                      />
                    )}
                  </Grid>

                  {/* Tipo de documento */}
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <FormControl fullWidth size="small" sx={fieldStyle}>
                      <InputLabel>Tipo de Documento</InputLabel>
                      <Select
                        value={doc.tipo_documento}
                        onChange={(e) =>
                          onActualizarDocumento(index, 'tipo_documento', e.target.value)
                        }
                        label="Tipo de Documento"
                      >
                        {TIPOS_DOCUMENTO_MATRICULA.map((tipo) => (
                          <MenuItem key={tipo} value={tipo}>
                            {tipo.replace(/_/g, ' ').toUpperCase()}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Botón subir archivo */}
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <input
                      type="file"
                      id={`file-input-${index}`}
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange(index)}
                    />
                    <Button
                      variant={doc.file ? 'contained' : 'outlined'}
                      fullWidth
                      startIcon={<UploadIcon />}
                      onClick={handleFileClick(index)}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '12px',
                        fontWeight: 600,
                        ...(doc.file
                          ? {
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                              },
                            }
                          : {
                              borderColor: isDark ? '#facc15' : '#0288d1',
                              color: isDark ? '#facc15' : '#0288d1',
                            }),
                      }}
                    >
                      {doc.file ? (
                        <Box
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                          }}
                        >
                          {doc.file.name}
                        </Box>
                      ) : (
                        'Subir Archivo'
                      )}
                    </Button>
                  </Grid>

                  {/* Observaciones */}
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Observaciones"
                      value={doc.observaciones}
                      onChange={(e) =>
                        onActualizarDocumento(index, 'observaciones', e.target.value)
                      }
                      placeholder="Notas adicionales..."
                      sx={fieldStyle}
                    />
                  </Grid>

                  {/* Botón eliminar */}
                  <Grid size={{ xs: 12, sm: "auto" }}>
                    <IconButton
                      onClick={handleEliminarDocumento(index)}
                      sx={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        '&:hover': {
                          backgroundColor: '#ef4444',
                          color: '#fff',
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>

                {/* Info del archivo */}
                {doc.file && (
                  <Box
                    sx={{
                      mt: 2,
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'rgba(16, 185, 129, 0.2)',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      <strong>Archivo:</strong> {doc.file.name} •{' '}
                      <strong>Tamaño:</strong> {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: '16px',
            border: '2px dashed',
            borderColor: isDark
              ? 'rgba(250, 204, 21, 0.3)'
              : 'rgba(2, 136, 209, 0.3)',
            backgroundColor: isDark
              ? 'rgba(15, 23, 42, 0.3)'
              : 'rgba(255, 255, 255, 0.3)',
          }}
        >
          <UploadIcon
            sx={{
              fontSize: 64,
              color: isDark
                ? 'rgba(250, 204, 21, 0.5)'
                : 'rgba(2, 136, 209, 0.5)',
              mb: 2,
            }}
          />
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            No se han agregado documentos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Usa el botón "Agregar Documento" para adjuntar archivos a esta matrícula
          </Typography>
        </Paper>
      )}
    </Box>
  );
};