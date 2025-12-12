// components/SubirDocumentosModal.tsx
'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Paper,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { DocumentoSubido, TipoDocumento, TIPOS_DOCUMENTO } from '@/types/autoMatriculacionTypes';

interface DocumentoConfig {
  tipo: TipoDocumento;
  label: string;
  obligatorio: boolean;
  maxSize: number; // en MB
  acceptedFormats: string[];
  descripcion?: string;
}

const DOCUMENTOS_CONFIG: DocumentoConfig[] = [
  {
    tipo: TIPOS_DOCUMENTO.CEDULA_ESTUDIANTE,
    label: 'Cédula de Identidad del Estudiante',
    obligatorio: true,
    maxSize: 5,
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    descripcion: 'Imagen o PDF de la CI',
  },
  {
    tipo: TIPOS_DOCUMENTO.CERTIFICADO_NACIMIENTO,
    label: 'Certificado de Nacimiento',
    obligatorio: true,
    maxSize: 5,
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
  },
  {
    tipo: TIPOS_DOCUMENTO.LIBRETA_NOTAS,
    label: 'Libreta de Notas',
    obligatorio: false,
    maxSize: 10,
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    descripcion: 'Últimas calificaciones',
  },
  {
    tipo: TIPOS_DOCUMENTO.FOTO_ESTUDIANTE,
    label: 'Foto del Estudiante',
    obligatorio: false,
    maxSize: 2,
    acceptedFormats: ['image/jpeg', 'image/png'],
    descripcion: 'Foto tipo carnet',
  },
];

interface SubirDocumentosModalProps {
  open: boolean;
  onClose: () => void;
  onSubir: (archivos: { [tipo: string]: File }) => Promise<DocumentoSubido[]>;
  onEliminar: (cloudinaryId: string) => Promise<void>;
  isLoading?: boolean;
  documentosSubidos: DocumentoSubido[];
}

const SubirDocumentosModal: React.FC<SubirDocumentosModalProps> = ({
  open,
  onClose,
  onSubir,
  onEliminar,
  isLoading = false,
  documentosSubidos,
}) => {
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<{ [tipo: string]: File }>({});
  const [errores, setErrores] = useState<{ [tipo: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (tipo: TipoDocumento, file: File | null) => {
    if (!file) {
      setArchivosSeleccionados((prev) => {
        const { [tipo]: _, ...rest } = prev;
        return rest;
      });
      setErrores((prev) => {
        const { [tipo]: _, ...rest } = prev;
        return rest;
      });
      return;
    }

    const config = DOCUMENTOS_CONFIG.find((d) => d.tipo === tipo);
    if (!config) return;

    // Validar formato
    if (!config.acceptedFormats.includes(file.type)) {
      setErrores((prev) => ({
        ...prev,
        [tipo]: `Formato no permitido. Use: ${config.acceptedFormats.join(', ')}`,
      }));
      return;
    }

    // Validar tamaño
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > config.maxSize) {
      setErrores((prev) => ({
        ...prev,
        [tipo]: `El archivo debe ser menor a ${config.maxSize}MB (actual: ${sizeMB.toFixed(2)}MB)`,
      }));
      return;
    }

    // Archivo válido
    setArchivosSeleccionados((prev) => ({ ...prev, [tipo]: file }));
    setErrores((prev) => {
      const { [tipo]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleSubirTodos = async () => {
    if (Object.keys(archivosSeleccionados).length === 0) {
      alert('Selecciona al menos un archivo');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simular progreso (puedes mejorar esto con onUploadProgress de axios)
      const interval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      await onSubir(archivosSeleccionados);

      clearInterval(interval);
      setUploadProgress(100);

      // Limpiar selección
      setArchivosSeleccionados({});
      setErrores({});

      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
      }, 1000);
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      console.error('Error al subir documentos:', error);
    }
  };

  const handleEliminar = async (cloudinaryId: string) => {
    if (confirm('¿Estás seguro de eliminar este documento?')) {
      try {
        await onEliminar(cloudinaryId);
      } catch (error) {
        console.error('Error al eliminar documento:', error);
      }
    }
  };

  const documentoYaSubido = (tipo: TipoDocumento) => {
    return documentosSubidos.find((d) => d.tipo_documento === tipo);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UploadIcon />
          <Typography variant="h6">Subir Documentos</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          Sube los documentos requeridos para completar tu matrícula. Los archivos marcados con * son obligatorios.
        </Alert>

        {/* Progreso de subida */}
        {uploading && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Subiendo documentos... {uploadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}

        {/* Lista de documentos */}
        <List>
          {DOCUMENTOS_CONFIG.map((config) => {
            const docSubido = documentoYaSubido(config.tipo);
            const archivoSeleccionado = archivosSeleccionados[config.tipo];
            const error = errores[config.tipo];

            return (
              <Paper key={config.tipo} sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {config.label}
                      {config.obligatorio && <span style={{ color: 'red' }}> *</span>}
                    </Typography>
                    {docSubido && <CheckIcon color="success" fontSize="small" />}
                  </Box>
                  <Chip
                    label={`Max: ${config.maxSize}MB`}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                {config.descripcion && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {config.descripcion}
                  </Typography>
                )}

                {/* Documento ya subido */}
                {docSubido && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1,
                      bgcolor: 'success.light',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FileIcon fontSize="small" />
                      <Typography variant="body2">{docSubido.nombre_archivo}</Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEliminar(docSubido.cloudinary_id)}
                      disabled={isLoading}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}

                {/* Selector de archivo */}
                {!docSubido && (
                  <>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadIcon />}
                      fullWidth
                      disabled={uploading || isLoading}
                    >
                      {archivoSeleccionado ? archivoSeleccionado.name : 'Seleccionar archivo'}
                      <input
                        type="file"
                        hidden
                        accept={config.acceptedFormats.join(',')}
                        onChange={(e) => handleFileSelect(config.tipo, e.target.files?.[0] || null)}
                      />
                    </Button>

                    {/* Error de validación */}
                    {error && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {error}
                      </Alert>
                    )}

                    {/* Archivo seleccionado */}
                    {archivoSeleccionado && !error && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <CheckIcon color="success" fontSize="small" />
                        <Typography variant="caption" color="text.secondary">
                          {(archivoSeleccionado.size / (1024 * 1024)).toFixed(2)} MB
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </Paper>
            );
          })}
        </List>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={uploading} startIcon={<CloseIcon />}>
          Cerrar
        </Button>
        {Object.keys(archivosSeleccionados).length > 0 && (
          <Button
            variant="contained"
            onClick={handleSubirTodos}
            disabled={uploading || isLoading || Object.keys(errores).length > 0}
            startIcon={<UploadIcon />}
          >
            Subir {Object.keys(archivosSeleccionados).length} archivo(s)
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SubirDocumentosModal;