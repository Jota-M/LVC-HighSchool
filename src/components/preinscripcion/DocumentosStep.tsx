'use client';
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { PreInscripcionFormData, ErroresFormulario } from '@/types/preinscripcionTypes';

interface DocumentosStepProps {
  documentos: PreInscripcionFormData['documentos'];
  errors: ErroresFormulario;
  onChange: (field: keyof PreInscripcionFormData['documentos'], file: File | null) => void;
  modoRegistro?: 'nuevo' | 'padre_existente' | 'multiple'; // 🆕 Prop para saber el modo
}

interface PreviewFile {
  url: string;
  name: string;
  type: string;
}

const DOCUMENTOS_ESTUDIANTE = [
  {
    field: 'cedula_estudiante' as const,
    label: 'Cédula de Identidad del Estudiante',
    descripcion: 'Fotocopia legible de ambas caras',
    obligatorio: true,
  },
  {
    field: 'certificado_nacimiento' as const,
    label: 'Certificado de Nacimiento',
    descripcion: 'Original o fotocopia legalizada',
    obligatorio: true,
  },
  {
    field: 'libreta_notas' as const,
    label: 'Libreta de Notas',
    descripcion: 'Del último año cursado',
    obligatorio: true,
  },
  {
    field: 'foto_estudiante' as const,
    label: 'Foto del Estudiante',
    descripcion: 'Foto reciente tipo carnet (fondo blanco)',
    obligatorio: false,
  },
];

const DOCUMENTO_REPRESENTANTE = {
  field: 'cedula_representante' as const,
  label: 'Cédula del Padre/Madre/Tutor',
  descripcion: 'Fotocopia legible de ambas caras',
  obligatorio: true,
};

export default function DocumentosStep({ 
  documentos, 
  errors, 
  onChange,
  modoRegistro = 'nuevo' 
}: DocumentosStepProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);

  const handleFileChange = (field: keyof PreInscripcionFormData['documentos'], file: File | null) => {
    onChange(field, file);
  };

  const handlePreview = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    setPreviewFile({
      url: fileUrl,
      name: file.name,
      type: file.type,
    });
  };

  const handleClosePreview = () => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
  };

  const fieldStyle = {
    borderStyle: 'dashed',
    borderWidth: '3px',
    borderRadius: '16px',
    p: 4,
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: isDark ? '0 12px 32px rgba(250, 204, 21, 0.2)' : '0 12px 32px rgba(2, 136, 209, 0.2)',
    },
  };

  // 🆕 Mostrar mensaje si es padre existente
  const mostrarDocumentoRepresentante = modoRegistro !== 'padre_existente';

  return (
    <Box sx={{ gap: 4, display: 'flex', flexDirection: 'column' }}>
      {/* Instrucciones */}
      <Box
        sx={{
          backgroundColor: isDark ? 'rgba(250, 204, 21, 0.05)' : 'rgba(2, 136, 209, 0.05)',
          borderRadius: '16px',
          p: 3,
          border: isDark ? '2px solid rgba(250, 204, 21, 0.2)' : '2px solid rgba(2, 136, 209, 0.2)',
        }}
      >
        <Typography fontWeight={700} sx={{ mb: 2, fontSize: '1.1rem', color: isDark ? '#facc15' : '#0288d1' }}>
          📄 Instrucciones para la Carga de Documentos
        </Typography>
        <Box component="ul" sx={{ mt: 2, mb: 0, pl: 3 }}>
          <Typography component="li" sx={{ mb: 1, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(1,87,155,0.9)' }}>
            ✔️ Asegúrate de que los documentos estén escaneados en buena calidad
          </Typography>
          <Typography component="li" sx={{ mb: 1, color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(1,87,155,0.9)' }}>
            ✔️ Formatos permitidos: PDF, JPG, PNG (máximo 5MB por archivo)
          </Typography>
          <Typography component="li" sx={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(1,87,155,0.9)' }}>
            ✔️ Los documentos deben ser legibles y mostrar toda la información claramente
          </Typography>
        </Box>
      </Box>

      {/* 🆕 Alerta si es padre existente */}
      {!mostrarDocumentoRepresentante && (
        <Box
          sx={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '16px',
            p: 3,
            border: '2px solid #10b981',
          }}
        >
          <Typography fontWeight={700} sx={{ mb: 1, color: '#10b981' }}>
            ℹ️ Padre/Tutor Existente
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No es necesario volver a subir la cédula del padre/tutor, ya que está en el sistema.
            Solo sube los documentos del nuevo estudiante.
          </Typography>
        </Box>
      )}

      {/* Título: Documentos del Estudiante */}
      <Typography variant="h6" fontWeight={700} sx={{ mt: 2 }}>
        📚 Documentos del Estudiante
      </Typography>

      {/* Lista de documentos del estudiante */}
      {DOCUMENTOS_ESTUDIANTE.map((doc) => {
        const file = documentos[doc.field];
        const hasError = !!errors[doc.field];

        return (
          <Box key={doc.field}>
            <Typography
              fontWeight={600}
              mb={2}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(1,87,155,0.9)',
              }}
            >
              {doc.label}
              {doc.obligatorio && (
                <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                  *
                </Typography>
              )}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'text.secondary' }}>
              {doc.descripcion}
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                ...fieldStyle,
                backgroundColor: file
                  ? isDark
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(16, 185, 129, 0.05)'
                  : isDark
                  ? 'rgba(255,255,255,0.02)'
                  : 'rgba(1,87,155,0.02)',
                borderColor: hasError ? '#ef4444' : file ? '#10b981' : isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(2, 136, 209, 0.3)',
              }}
            >
              {file ? (
                <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 28 }} />
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography fontWeight={600} color={isDark ? '#fff' : '#000'}>
                        {file.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() => handlePreview(file)}
                      sx={{
                        backgroundColor: isDark ? 'rgba(2, 136, 209, 0.2)' : 'rgba(2, 136, 209, 0.1)',
                        '&:hover': { backgroundColor: '#0288d1', color: '#fff' },
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleFileChange(doc.field, null)}
                      sx={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        '&:hover': { backgroundColor: '#ef4444', color: '#fff' },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <>
                  <UploadFileIcon
                    sx={{
                      fontSize: 56,
                      color: hasError ? '#ef4444' : isDark ? 'rgba(250, 204, 21, 0.5)' : 'rgba(2, 136, 209, 0.5)',
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    sx={{ mb: 3, color: hasError ? '#ef4444' : isDark ? 'rgba(255,255,255,0.8)' : 'rgba(1,87,155,0.9)' }}
                  >
                    {doc.label}
                  </Typography>
                  <Button
                    variant="contained"
                    component="label"
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      background: isDark
                        ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                      color: isDark ? '#000' : '#fff',
                    }}
                  >
                    Seleccionar Archivo
                    <input
                      hidden
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0] || null;
                        handleFileChange(doc.field, selectedFile);
                      }}
                    />
                  </Button>
                  {hasError && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 2 }}>
                      {errors[doc.field]}
                    </Typography>
                  )}
                </>
              )}
            </Paper>
          </Box>
        );
      })}

      {/* 🆕 Documento del representante (solo si no es padre existente) */}
      {mostrarDocumentoRepresentante && (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mt: 4 }}>
            👤 Documento del Padre/Tutor
          </Typography>

          <Box>
            <Typography
              fontWeight={600}
              mb={2}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(1,87,155,0.9)',
              }}
            >
              {DOCUMENTO_REPRESENTANTE.label}
              <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                *
              </Typography>
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'text.secondary' }}>
              {DOCUMENTO_REPRESENTANTE.descripcion}
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                ...fieldStyle,
                backgroundColor: documentos.cedula_representante
                  ? isDark
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(16, 185, 129, 0.05)'
                  : isDark
                  ? 'rgba(255,255,255,0.02)'
                  : 'rgba(1,87,155,0.02)',
                borderColor: errors.cedula_representante
                  ? '#ef4444'
                  : documentos.cedula_representante
                  ? '#10b981'
                  : isDark
                  ? 'rgba(250, 204, 21, 0.3)'
                  : 'rgba(2, 136, 209, 0.3)',
              }}
            >
              {documentos.cedula_representante ? (
                <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 28 }} />
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography fontWeight={600} color={isDark ? '#fff' : '#000'}>
                        {documentos.cedula_representante.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(documentos.cedula_representante.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() => handlePreview(documentos.cedula_representante!)}
                      sx={{
                        backgroundColor: isDark ? 'rgba(2, 136, 209, 0.2)' : 'rgba(2, 136, 209, 0.1)',
                        '&:hover': { backgroundColor: '#0288d1', color: '#fff' },
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleFileChange('cedula_representante', null)}
                      sx={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        '&:hover': { backgroundColor: '#ef4444', color: '#fff' },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <>
                  <UploadFileIcon
                    sx={{
                      fontSize: 56,
                      color: errors.cedula_representante
                        ? '#ef4444'
                        : isDark
                        ? 'rgba(250, 204, 21, 0.5)'
                        : 'rgba(2, 136, 209, 0.5)',
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    sx={{
                      mb: 3,
                      color: errors.cedula_representante
                        ? '#ef4444'
                        : isDark
                        ? 'rgba(255,255,255,0.8)'
                        : 'rgba(1,87,155,0.9)',
                    }}
                  >
                    {DOCUMENTO_REPRESENTANTE.label}
                  </Typography>
                  <Button
                    variant="contained"
                    component="label"
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      background: isDark
                        ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                      color: isDark ? '#000' : '#fff',
                    }}
                  >
                    Seleccionar Archivo
                    <input
                      hidden
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0] || null;
                        handleFileChange('cedula_representante', selectedFile);
                      }}
                    />
                  </Button>
                  {errors.cedula_representante && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 2 }}>
                      {errors.cedula_representante}
                    </Typography>
                  )}
                </>
              )}
            </Paper>
          </Box>
        </>
      )}

      {/* Modal de previsualización */}
      <Dialog open={!!previewFile} onClose={handleClosePreview} maxWidth="md" fullWidth>
        {previewFile && (
          <>
            <DialogContent sx={{ p: 0, bgcolor: '#000' }}>
              {previewFile.type === 'application/pdf' ? (
                <iframe
                  src={previewFile.url}
                  style={{ width: '100%', height: '70vh', border: 'none' }}
                  title="PDF Preview"
                />
              ) : (
                <Box
                  component="img"
                  src={previewFile.url}
                  alt="Preview"
                  sx={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClosePreview} color="primary">
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}