// components/seguimiento-preinscripcion/DocumentosEditables.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Alert,
  AlertTitle,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { PreDocumento } from '@/types/preinscripcionTypes';

interface DocumentosEditablesProps {
  documentos: PreDocumento[];
  onResubir: (tipo: string, archivo: File) => Promise<{ success: boolean; error?: string }>;
  guardando: boolean;
}

const LABELS_DOCUMENTOS: Record<string, string> = {
  cedula_estudiante: 'Cédula del Estudiante',
  certificado_nacimiento: 'Certificado de Nacimiento',
  libreta_notas: 'Libreta de Notas',
  cedula_tutor: 'Cédula del Tutor',
};

const TIPOS_DOCUMENTO = [
  'cedula_estudiante',
  'certificado_nacimiento',
  'libreta_notas',
  'cedula_tutor',
];

export const DocumentosEditables: React.FC<DocumentosEditablesProps> = ({
  documentos,
  onResubir,
  guardando,
}) => {
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [previewFile, setPreviewFile] = useState<{ url: string; nombre: string } | null>(null);
  
  // 🆕 Estado local de documentos que se actualiza inmediatamente
  const [documentosActuales, setDocumentosActuales] = useState<PreDocumento[]>(documentos);

  // 🆕 Actualizar documentos locales cuando cambien los props
  useEffect(() => {
    setDocumentosActuales(documentos);
  }, [documentos]);

  const handleResubir = async (tipoDoc: string, file: File) => {
    setUploadingDoc(tipoDoc);
    setMensaje(null);

    const resultado = await onResubir(tipoDoc, file);

    if (resultado.success) {
      setMensaje({ 
        tipo: 'success', 
        texto: 'Documento actualizado correctamente. Será revisado nuevamente.' 
      });

      // 🆕 ACTUALIZAR INMEDIATAMENTE EL ESTADO LOCAL
      // Esto actualiza la UI antes de que llegue la respuesta del servidor
      const docIndex = documentosActuales.findIndex(d => d.tipo_documento === tipoDoc);
      
      if (docIndex !== -1) {
        // Actualizar documento existente
        const nuevosDocumentos = [...documentosActuales];
        nuevosDocumentos[docIndex] = {
          ...nuevosDocumentos[docIndex],
          nombre_archivo: file.name,
          subido: true,
          fecha_subida: new Date().toISOString(),
          verificado: false,
          requiere_correccion: false,
          motivo_correccion: null,
          // Crear URL temporal para preview inmediato
          url_archivo: URL.createObjectURL(file),
        };
        setDocumentosActuales(nuevosDocumentos);
      } else {
        // Agregar nuevo documento
        const nuevoDoc: PreDocumento = {
          id: Date.now(), // ID temporal
          pre_inscripcion_id: 0, // Se actualizará con la respuesta real
          tipo_documento: tipoDoc as any,
          es_obligatorio: true,
          nombre_archivo: file.name,
          url_archivo: URL.createObjectURL(file),
          tamano_bytes: file.size,
          tipo_mime: file.type,
          subido: true,
          fecha_subida: new Date().toISOString(),
          verificado: false,
          fecha_verificacion: null,
          verificado_por: null,
          observaciones: null,
          requiere_correccion: false,
          motivo_correccion: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setDocumentosActuales([...documentosActuales, nuevoDoc]);
      }

      // Cerrar el preview si está abierto
      if (previewFile) {
        setPreviewFile(null);
      }

    } else {
      setMensaje({ tipo: 'error', texto: resultado.error || 'Error al subir documento' });
    }

    setUploadingDoc(null);
  };

  const handlePreview = (doc: PreDocumento) => {
    if (doc.url_archivo) {
      setPreviewFile({
        url: doc.url_archivo,
        nombre: doc.nombre_archivo || LABELS_DOCUMENTOS[doc.tipo_documento]
      });
    }
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  // Obtener estado del documento por tipo (ahora usa documentosActuales)
  const getDocumentoPorTipo = (tipo: string): PreDocumento | null => {
    return documentosActuales.find(d => d.tipo_documento === tipo) || null;
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={3}>
        Documentos Adjuntos
      </Typography>

      {mensaje && (
        <Alert 
          severity={mensaje.tipo} 
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setMensaje(null)}
        >
          {mensaje.texto}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        <AlertTitle fontWeight={700}>Instrucciones</AlertTitle>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Puedes cambiar o agregar documentos en cualquier momento</li>
          <li>Verifica que los documentos estén legibles y completos</li>
          <li>Formatos permitidos: PDF, JPG, PNG (máximo 5MB)</li>
          <li>Si cambias un documento ya verificado, será revisado nuevamente</li>
        </ul>
      </Alert>

      <Grid container spacing={2}>
        {TIPOS_DOCUMENTO.map((tipo) => {
          const doc = getDocumentoPorTipo(tipo);
          const tieneArchivo = doc && doc.url_archivo;
          const estaSubiendo = uploadingDoc === tipo;

          return (
            <Grid size={{xs:12, md:6}} key={tipo}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2,
                  borderColor: doc?.verificado
                    ? '#10b981'
                    : doc?.requiere_correccion
                    ? '#ef4444'
                    : tieneArchivo
                    ? '#fbbf24'
                    : '#cbd5e1',
                  borderWidth: 2,
                  position: 'relative',
                  minHeight: 180,
                  // 🆕 Efecto visual mientras sube
                  opacity: estaSubiendo ? 0.6 : 1,
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Loading overlay */}
                {estaSubiendo && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(255,255,255,0.9)',
                      borderRadius: 2,
                      zIndex: 10,
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress size={40} />
                      <Typography variant="body2" sx={{ mt: 2, fontWeight: 600 }}>
                        Subiendo...
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Header */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>
                    {LABELS_DOCUMENTOS[tipo]}
                  </Typography>
                  
                  {doc && (
                    <Chip
                      size="small"
                      label={
                        doc.verificado
                          ? 'Verificado ✓'
                          : doc.requiere_correccion
                          ? 'Requiere Corrección'
                          : tieneArchivo
                          ? 'En Revisión'
                          : 'Sin subir'
                      }
                      color={
                        doc.verificado 
                          ? 'success' 
                          : doc.requiere_correccion 
                          ? 'error' 
                          : tieneArchivo
                          ? 'warning'
                          : 'default'
                      }
                      icon={
                        doc.verificado ? (
                          <CheckCircleIcon />
                        ) : doc.requiere_correccion ? (
                          <ErrorIcon />
                        ) : tieneArchivo ? (
                          <PendingIcon />
                        ) : undefined
                      }
                    />
                  )}
                </Box>

                {/* Contenido */}
                {tieneArchivo ? (
                  <Box>
                    {/* Info del archivo */}
                    <Box 
                      sx={{ 
                        mb: 2, 
                        p: 2, 
                        bgcolor: 'rgba(0,0,0,0.02)', 
                        borderRadius: 2 
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Archivo actual:
                      </Typography>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {doc?.nombre_archivo || 'documento.pdf'}
                      </Typography>
                    </Box>

                    {/* Observaciones/Motivos */}
                    {doc?.observaciones && (
                      <Alert severity="info" sx={{ mb: 2, fontSize: '0.8rem' }}>
                        {doc.observaciones}
                      </Alert>
                    )}

                    {doc?.requiere_correccion && (
                      <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>
                        <strong>Motivo:</strong> {doc.motivo_correccion}
                      </Alert>
                    )}

                    {/* Acciones */}
                    <Grid container spacing={1}>
                      <Grid size={{xs:6}}>
                        <Button
                          fullWidth
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => doc && handlePreview(doc)}
                          disabled={estaSubiendo}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                          }}
                        >
                          Ver
                        </Button>
                      </Grid>
                      <Grid size={{xs:6}}>
                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          component="label"
                          startIcon={<EditIcon />}
                          disabled={estaSubiendo || guardando}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            background: doc?.requiere_correccion 
                              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                              : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          }}
                        >
                          Cambiar
                          <input
                            hidden
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // 🆕 Limpiar el input para permitir subir el mismo archivo otra vez
                                e.target.value = '';
                                handleResubir(tipo, file);
                              }
                            }}
                          />
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  // SIN ARCHIVO - Mostrar botón de subir
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 3,
                    }}
                  >
                    <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      No hay archivo subido
                    </Typography>
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<UploadFileIcon />}
                      disabled={estaSubiendo || guardando}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        fontWeight: 600,
                      }}
                    >
                      Subir Archivo
                      <input
                        hidden
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            e.target.value = '';
                            handleResubir(tipo, file);
                          }
                        }}
                      />
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Dialog de Preview */}
      <Dialog 
        open={!!previewFile} 
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        {previewFile && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={700}>
                {previewFile.nombre}
              </Typography>
              <IconButton onClick={handleClosePreview}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, bgcolor: '#000', minHeight: '70vh' }}>
              {previewFile.url.toLowerCase().endsWith('.pdf') || previewFile.url.includes('application/pdf') ? (
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
                  sx={{ 
                    width: '100%', 
                    height: '70vh', 
                    objectFit: 'contain',
                    bgcolor: '#000'
                  }}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={handleClosePreview} 
                variant="contained"
                sx={{ borderRadius: 2 }}
              >
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};