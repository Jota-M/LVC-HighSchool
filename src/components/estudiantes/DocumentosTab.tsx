// components/estudiantes/DocumentosTab.tsx
import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  useTheme,
  Divider,
} from '@mui/material';
import {
  UploadFile as UploadIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  Verified as VerifiedIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useDocumentos } from '@/hooks/useDocumentos';
import { TIPOS_DOCUMENTO, Documento } from '@/types/documentosTypes';

interface Matricula {
  id: number;
  periodo: string;
  grado: string;
  paralelo: string;
  estado: string;
}

interface DocumentosTabProps {
  estudianteId: number;
  matriculas: Matricula[];
}

export const DocumentosTab: React.FC<DocumentosTabProps> = ({
  estudianteId,
  matriculas,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [selectedMatricula, setSelectedMatricula] = useState<number | null>(
    matriculas.length > 0 ? matriculas[0].id : null
  );
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentoToDelete, setDocumentoToDelete] = useState<Documento | null>(null);

  // Hook personalizado para documentos
  const {
    documentos,
    isLoading,
    subirDocumento,
    verificarDocumento,
    eliminarDocumento,
    isSubiendo,
    isEliminando,
  } = useDocumentos(selectedMatricula);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>, tipoDoc: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    subirDocumento(
      { tipo_documento: tipoDoc, archivo: file },
      {
        onSuccess: () => {
          setUploadDialogOpen(false);
        },
      }
    );
  };

  const handleDelete = (documento: Documento) => {
    setDocumentoToDelete(documento);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (documentoToDelete) {
      eliminarDocumento(documentoToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setDocumentoToDelete(null);
        },
      });
    }
  };

  const handleView = (url: string) => {
    window.open(url, '_blank');
  };

  if (matriculas.length === 0) {
    return (
      <Alert severity="info" icon={<AssignmentIcon />}>
        El estudiante no tiene matrículas registradas. Los documentos se asocian a las
        matrículas.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Selector de matrícula */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Selecciona una matrícula para ver sus documentos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {matriculas.map((matricula) => (
            <Button
              key={matricula.id}
              variant={selectedMatricula === matricula.id ? 'contained' : 'outlined'}
              onClick={() => setSelectedMatricula(matricula.id)}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                ...(selectedMatricula === matricula.id && {
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  color: isDark ? '#000' : '#fff',
                }),
              }}
            >
              {matricula.periodo} - {matricula.grado} {matricula.paralelo}
            </Button>
          ))}
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Botón de subir documento */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>
          Documentos ({documentos?.length || 0})
        </Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setUploadDialogOpen(true)}
          disabled={!selectedMatricula}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
          }}
        >
          Subir Documento
        </Button>
      </Box>

      {/* Lista de documentos */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : documentos && documentos.length > 0 ? (
        <Grid container spacing={3}>
          {documentos.map((doc) => (
            <Grid size={{xs:12, md:6}} key={doc.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: `2px solid ${
                    doc.verificado ? '#10b981' : 'rgba(255, 193, 7, 0.3)'
                  }`,
                  position: 'relative',
                }}
              >
                {/* Badge de verificación */}
                {doc.verificado && (
                  <Chip
                    icon={<VerifiedIcon />}
                    label="Verificado"
                    size="small"
                    color="success"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                    }}
                  />
                )}

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: doc.verificado
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(255, 193, 7, 0.1)',
                    }}
                  >
                    {doc.verificado ? (
                      <CheckIcon sx={{ color: '#10b981', fontSize: 28 }} />
                    ) : (
                      <WarningIcon sx={{ color: '#ffc107', fontSize: 28 }} />
                    )}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight={700} sx={{ mb: 0.5 }}>
                      {TIPOS_DOCUMENTO[doc.tipo_documento as keyof typeof TIPOS_DOCUMENTO] ||
                        doc.tipo_documento}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 1 }}
                    >
                      {doc.nombre_archivo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Subido: {format(new Date(doc.created_at), 'dd/MM/yyyy HH:mm')}
                    </Typography>

                    {doc.verificado && doc.fecha_verificacion && (
                      <Typography
                        variant="caption"
                        color="success.main"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        ✓ Verificado:{' '}
                        {format(new Date(doc.fecha_verificacion), 'dd/MM/yyyy HH:mm')}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {doc.observaciones && (
                  <Alert severity="info" sx={{ mb: 2, borderRadius: '8px' }}>
                    <Typography variant="caption">{doc.observaciones}</Typography>
                  </Alert>
                )}

                {/* Acciones */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleView(doc.url_archivo)}
                    sx={{
                      bgcolor: isDark
                        ? 'rgba(2, 136, 209, 0.2)'
                        : 'rgba(2, 136, 209, 0.1)',
                      '&:hover': { bgcolor: '#0288d1', color: '#fff' },
                    }}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    component="a"
                    href={doc.url_archivo}
                    download
                    sx={{
                      bgcolor: isDark
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(16, 185, 129, 0.1)',
                      '&:hover': { bgcolor: '#10b981', color: '#fff' },
                    }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>

                  {!doc.verificado && (
                    <IconButton
                      size="small"
                      onClick={() => verificarDocumento({ documentoId: doc.id })}
                      sx={{
                        bgcolor: isDark
                          ? 'rgba(250, 204, 21, 0.2)'
                          : 'rgba(250, 204, 21, 0.1)',
                        '&:hover': { bgcolor: '#facc15', color: '#000' },
                      }}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  )}

                  <IconButton
                    size="small"
                    onClick={() => handleDelete(doc)}
                    sx={{
                      bgcolor: 'rgba(239, 68, 68, 0.1)',
                      '&:hover': { bgcolor: '#ef4444', color: '#fff' },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
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
          }}
        >
          <UploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No hay documentos cargados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Haz clic en "Subir Documento" para agregar archivos
          </Typography>
        </Paper>
      )}

      {/* Dialog de subir documento */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            backgroundColor: isDark
              ? 'rgba(15, 23, 42, 0.95)'
              : 'rgba(255, 255, 255, 0.98)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Subir Documento</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Selecciona el tipo de documento que deseas subir
          </Typography>

          <Grid container spacing={2}>
            {Object.entries(TIPOS_DOCUMENTO).map(([key, label]) => (
              <Grid size={{xs:12, sm:6}} key={key}>
                <Button
                  fullWidth
                  component="label"
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  disabled={isSubiendo}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1.5,
                    justifyContent: 'flex-start',
                  }}
                >
                  {label}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    hidden
                    onChange={(e) => handleUpload(e, key)}
                  />
                </Button>
              </Grid>
            ))}
          </Grid>

          {isSubiendo && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={isSubiendo}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            backgroundColor: isDark
              ? 'rgba(15, 23, 42, 0.95)'
              : 'rgba(255, 255, 255, 0.98)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>¿Eliminar documento?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            ¿Estás seguro de que deseas eliminar el documento{' '}
            <strong>{documentoToDelete?.nombre_archivo}</strong>? Esta acción no se puede
            deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isEliminando}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={isEliminando}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '12px' }}
          >
            {isEliminando ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentosTab;