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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Documento {
  id: number;
  matricula_id: number;
  tipo_documento: string;
  nombre_archivo: string;
  url_archivo: string;
  verificado: boolean;
  verificado_por?: number;
  fecha_verificacion?: string;
  observaciones?: string;
  created_at: string;
}

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

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

const tiposDocumento: Record<string, string> = {
  certificado_nacimiento: 'Certificado de Nacimiento',
  ci_estudiante: 'CI del Estudiante',
  ci_tutor: 'CI del Tutor',
  libreta_familiar: 'Libreta Familiar',
  certificado_medico: 'Certificado Médico',
  boletin_anterior: 'Boletín del Año Anterior',
  comprobante_pago: 'Comprobante de Pago',
  otro: 'Otro Documento',
};

export const DocumentosTab: React.FC<DocumentosTabProps> = ({ estudianteId, matriculas }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [selectedMatricula, setSelectedMatricula] = useState<number | null>(
    matriculas.length > 0 ? matriculas[0].id : null
  );
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentoToDelete, setDocumentoToDelete] = useState<Documento | null>(null);
  const [uploading, setUploading] = useState(false);

  // Query para obtener documentos
  const { data: documentos, isLoading } = useQuery<Documento[]>({
    queryKey: ['matricula-documentos', selectedMatricula],
    queryFn: async () => {
      if (!selectedMatricula) return [];
      const response = await fetch(`${API_URL}/matricula/${selectedMatricula}/documentos`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al cargar documentos');
      const result = await response.json();
      return result.data.documentos;
    },
    enabled: !!selectedMatricula,
  });

  // Mutation para verificar documento
  const verificarMutation = useMutation({
    mutationFn: async (documentoId: number) => {
      const response = await fetch(
        `${API_URL}/matricula/${selectedMatricula}/documentos/${documentoId}/verificar`,
        {
          method: 'PATCH',
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error('Error al verificar documento');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matricula-documentos', selectedMatricula] });
      enqueueSnackbar('Documento verificado exitosamente', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message, { variant: 'error' });
    },
  });

  // Mutation para eliminar documento
  const eliminarMutation = useMutation({
    mutationFn: async (documentoId: number) => {
      const response = await fetch(
        `${API_URL}/matricula/${selectedMatricula}/documentos/${documentoId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error('Error al eliminar documento');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matricula-documentos', selectedMatricula] });
      enqueueSnackbar('Documento eliminado exitosamente', { variant: 'success' });
      setDeleteDialogOpen(false);
      setDocumentoToDelete(null);
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message, { variant: 'error' });
    },
  });

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, tipoDoc: string) => {
    const file = event.target.files?.[0];
    if (!file || !selectedMatricula) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('documento', file);
      formData.append('tipo_documento', tipoDoc);

      const response = await fetch(`${API_URL}/matricula/${selectedMatricula}/documentos`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al subir documento');
      }

      queryClient.invalidateQueries({ queryKey: ['matricula-documentos', selectedMatricula] });
      enqueueSnackbar('Documento subido exitosamente', { variant: 'success' });
      setUploadDialogOpen(false);
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (documento: Documento) => {
    setDocumentoToDelete(documento);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (documentoToDelete) {
      eliminarMutation.mutate(documentoToDelete.id);
    }
  };

  const handleView = (url: string) => {
    window.open(url, '_blank');
  };

  if (matriculas.length === 0) {
    return (
      <Alert severity="info" icon={<AssignmentIcon />}>
        El estudiante no tiene matrículas registradas. Los documentos se asocian a las matrículas.
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
                  border: `2px solid ${doc.verificado ? '#10b981' : 'rgba(255, 193, 7, 0.3)'}`,
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
                      bgcolor: doc.verificado ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 193, 7, 0.1)',
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
                      {tiposDocumento[doc.tipo_documento] || doc.tipo_documento}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {doc.nombre_archivo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Subido: {format(new Date(doc.created_at), 'dd/MM/yyyy HH:mm')}
                    </Typography>

                    {doc.verificado && doc.fecha_verificacion && (
                      <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                        ✓ Verificado: {format(new Date(doc.fecha_verificacion), 'dd/MM/yyyy HH:mm')}
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
                      bgcolor: isDark ? 'rgba(2, 136, 209, 0.2)' : 'rgba(2, 136, 209, 0.1)',
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
                      bgcolor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                      '&:hover': { bgcolor: '#10b981', color: '#fff' },
                    }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>

                  {!doc.verificado && (
                    <IconButton
                      size="small"
                      onClick={() => verificarMutation.mutate(doc.id)}
                      disabled={verificarMutation.isPending}
                      sx={{
                        bgcolor: isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(250, 204, 21, 0.1)',
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
            borderColor: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(2, 136, 209, 0.3)',
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
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Subir Documento</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Selecciona el tipo de documento que deseas subir
          </Typography>

          <Grid container spacing={2}>
            {Object.entries(tiposDocumento).map(([key, label]) => (
              <Grid size={{xs:12, sm:6}} key={key}>
                <Button
                  fullWidth
                  component="label"
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  disabled={uploading}
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

          {uploading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
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
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>¿Eliminar documento?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            ¿Estás seguro de que deseas eliminar el documento{' '}
            <strong>{documentoToDelete?.nombre_archivo}</strong>? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={eliminarMutation.isPending}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={eliminarMutation.isPending}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '12px' }}
          >
            {eliminarMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentosTab;