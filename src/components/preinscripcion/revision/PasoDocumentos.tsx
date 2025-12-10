// components/preinscripcion/revision/PasoDocumentos.tsx
'use client';
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  TextField,
  Button,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import DocumentoCard from './DocumentoCard';
import ModalVisorDocumento from './ModalVisorDocumento';
import { PreInscripcionDetalle } from '@/types/preinscripcionTypes';

interface PasoDocumentosProps {
  preinscripcion: PreInscripcionDetalle;
  notasDocumentos: string;
  setNotasDocumentos: (notas: string) => void;
  aprobarDocumentos: () => Promise<void>;
  solicitarDocumentos: (observaciones: string) => Promise<void>;
  rechazar: (motivo: string) => Promise<void>;
  saving: boolean;
}

export default function PasoDocumentos({
  preinscripcion,
  notasDocumentos,
  setNotasDocumentos,
  aprobarDocumentos,
  solicitarDocumentos,
  rechazar,
  saving,
}: PasoDocumentosProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [modalOpen, setModalOpen] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<any>(null);

  const documentos = [
    {
      id: 1,
      nombre: 'Cédula de Identidad del Estudiante',
      archivo: 'Archivo subido',
      url: preinscripcion.documentos?.find(
        (d) => d.tipo_documento === 'cedula_estudiante'
      )?.url_archivo,
      disponible: !!preinscripcion.documentos?.find(
        (d) => d.tipo_documento === 'cedula_estudiante'
      ),
      icon: '📄',
    },
    {
      id: 2,
      nombre: 'Certificado de Nacimiento',
      archivo: 'Archivo subido',
      url: preinscripcion.documentos?.find(
        (d) => d.tipo_documento === 'certificado_nacimiento'
      )?.url_archivo,
      disponible: !!preinscripcion.documentos?.find(
        (d) => d.tipo_documento === 'certificado_nacimiento'
      ),
      icon: '📜',
    },
    {
      id: 3,
      nombre: 'Libreta de Notas',
      archivo: 'Archivo subido',
      url: preinscripcion.documentos?.find(
        (d) => d.tipo_documento === 'libreta_notas'
      )?.url_archivo,
      disponible: !!preinscripcion.documentos?.find(
        (d) => d.tipo_documento === 'libreta_notas'
      ),
      icon: '📚',
    },
    {
      id: 4,
      nombre: 'Cédula del Representante',
      archivo: 'Archivo subido',
      url: preinscripcion.documentos?.find(
        (d) => d.tipo_documento === 'cedula_tutor'
      )?.url_archivo,
      disponible: !!preinscripcion.documentos?.find(
        (d) => d.tipo_documento === 'cedula_tutor'
      ),
      icon: '🪪',
    },
  ];

  const criteriosVerificacion = [
    'Documentos legibles y de buena calidad',
    'Información consistente entre documentos',
    'Fechas de vigencia actualizadas',
    'Firmas y sellos oficiales presentes',
  ];

  const handleVerDocumento = (doc: any) => {
    if (doc.disponible && doc.url) {
      setDocumentoSeleccionado(doc);
      setModalOpen(true);
    }
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Estilos dinámicos según el tema
  const cardStyle = {
    borderRadius: 4,
    border: '1px solid',
    borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
    boxShadow: isDark
      ? '0 8px 32px rgba(0,0,0,0.4)'
      : '0 8px 24px rgba(0,0,0,0.08)',
    background: isDark
      ? 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)'
      : '#ffffff',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: isDark
        ? '0 12px 40px rgba(0,0,0,0.5)'
        : '0 12px 32px rgba(0,0,0,0.12)',
    },
  };

  const headerIconStyle = {
    width: 56,
    height: 56,
    borderRadius: 3,
    background: isDark
      ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
      : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: isDark
      ? '0 4px 20px rgba(96, 165, 250, 0.4)'
      : '0 4px 15px rgba(59, 130, 246, 0.3)',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    '@keyframes pulse': {
      '0%, 100%': {
        opacity: 1,
      },
      '50%': {
        opacity: 0.8,
      },
    },
  };

  return (
    <>
      {/* Header del paso */}
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={2}
            flexWrap="wrap"
            gap={2}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={headerIconStyle}>
                <DescriptionIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    background: isDark
                      ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
                      : 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Verificación de Documentos
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: isDark ? alpha('#fff', 0.7) : 'text.secondary' }}
                >
                  Revisar y validar todos los documentos adjuntados
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={<AccessTimeIcon />}
              label={`Subido: ${formatearFecha(preinscripcion.fecha_inicio)}`}
              sx={{
                bgcolor: isDark ? alpha('#10b981', 0.2) : alpha('#10b981', 0.1),
                color: isDark ? '#6ee7b7' : '#059669',
                fontWeight: 600,
                border: '1px solid',
                borderColor: isDark ? '#6ee7b7' : '#10b981',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: isDark ? alpha('#10b981', 0.3) : alpha('#10b981', 0.15),
                  transform: 'scale(1.05)',
                },
              }}
            />
          </Box>

          <LinearProgress
            variant="determinate"
            value={33}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
              '& .MuiLinearProgress-bar': {
                background: isDark
                  ? 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)'
                  : 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: 4,
                transition: 'all 0.5s ease',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      <Card sx={{ ...cardStyle, mb: 3, mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: isDark ? '#fff' : 'text.primary',
            }}
          >
            Lista de Documentos a Verificar:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {documentos.map((doc, index) => (
              <Box
                key={doc.id}
                sx={{
                  animation: `fadeInUp 0.5s ease ${index * 0.1}s both`,
                  '@keyframes fadeInUp': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(20px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                <DocumentoCard
                  nombre={doc.nombre}
                  archivo={doc.archivo}
                  disponible={doc.disponible}
                  icon={doc.icon}
                  onVer={() => handleVerDocumento(doc)}
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Notas y Acciones */}
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: isDark ? '#fff' : 'text.primary',
            }}
          >
            Notas de Verificación:
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Agrega observaciones o comentarios sobre la verificación de documentos..."
            value={notasDocumentos}
            onChange={(e) => setNotasDocumentos(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.02),
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.04),
                },
                '&.Mui-focused': {
                  bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#3b82f6', 0.05),
                },
              },
            }}
          />

          <Divider sx={{ my: 3, borderColor: isDark ? alpha('#fff', 0.1) : undefined }} />

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Box display="flex" gap={2} flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                sx={{
                  borderRadius: 2,
                  borderWidth: 2,
                  borderColor: isDark ? alpha('#06b6d4', 0.5) : '#06b6d4',
                  color: isDark ? '#22d3ee' : '#0891b2',
                  fontWeight: 600,
                  px: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: isDark ? '#22d3ee' : '#0891b2',
                    bgcolor: isDark ? alpha('#06b6d4', 0.15) : alpha('#06b6d4', 0.1),
                    transform: 'translateY(-2px)',
                    boxShadow: isDark
                      ? '0 8px 20px rgba(6, 182, 212, 0.3)'
                      : '0 8px 20px rgba(6, 182, 212, 0.2)',
                  },
                }}
              >
                Descargar Todo
              </Button>

              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => solicitarDocumentos(notasDocumentos)}
                disabled={saving}
                sx={{
                  borderRadius: 2,
                  borderWidth: 2,
                  borderColor: isDark ? alpha('#f59e0b', 0.5) : '#f59e0b',
                  color: isDark ? '#fbbf24' : '#d97706',
                  fontWeight: 600,
                  px: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: isDark ? '#fbbf24' : '#d97706',
                    bgcolor: isDark ? alpha('#f59e0b', 0.15) : alpha('#f59e0b', 0.1),
                    transform: 'translateY(-2px)',
                    boxShadow: isDark
                      ? '0 8px 20px rgba(245, 158, 11, 0.3)'
                      : '0 8px 20px rgba(245, 158, 11, 0.2)',
                  },
                  '&:disabled': {
                    borderColor: alpha('#999', 0.3),
                    color: alpha('#999', 0.5),
                  },
                }}
              >
                {saving ? 'Enviando...' : 'Solicitar Corrección'}
              </Button>
            </Box>

            <Box display="flex" gap={2} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<CancelIcon />}
                onClick={() => rechazar(notasDocumentos)}
                disabled={saving}
                sx={{
                  borderRadius: 2,
                  background: isDark
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  px: 3,
                  boxShadow: isDark
                    ? '0 4px 15px rgba(239, 68, 68, 0.4)'
                    : '0 4px 15px rgba(220, 38, 38, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: isDark
                      ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                      : 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: isDark
                      ? '0 8px 25px rgba(239, 68, 68, 0.5)'
                      : '0 8px 25px rgba(220, 38, 38, 0.4)',
                  },
                  '&:disabled': {
                    background: alpha('#999', 0.3),
                    color: alpha('#fff', 0.5),
                  },
                }}
              >
                Rechazar
              </Button>

              <Button
                variant="contained"
                startIcon={<TaskAltIcon />}
                onClick={aprobarDocumentos}
                disabled={saving}
                sx={{
                  borderRadius: 2,
                  background: isDark
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  px: 3,
                  boxShadow: isDark
                    ? '0 4px 15px rgba(16, 185, 129, 0.4)'
                    : '0 4px 15px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: isDark
                      ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                      : 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: isDark
                      ? '0 8px 25px rgba(16, 185, 129, 0.5)'
                      : '0 8px 25px rgba(16, 185, 129, 0.4)',
                  },
                  '&:disabled': {
                    background: alpha('#999', 0.3),
                    color: alpha('#fff', 0.5),
                  },
                }}
              >
                {saving ? 'Aprobando...' : 'Aprobar y Continuar'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Criterios de Verificación */}
      <Card sx={{ ...cardStyle, mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: isDark ? '#fff' : 'text.primary',
            }}
          >
            Criterios de Verificación:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {criteriosVerificacion.map((criterio, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: isDark ? alpha('#10b981', 0.15) : alpha('#10b981', 0.1),
                  border: '2px solid',
                  borderColor: isDark ? alpha('#10b981', 0.3) : '#10b981',
                  transition: 'all 0.3s ease',
                  animation: `slideIn 0.5s ease ${index * 0.1}s both`,
                  '&:hover': {
                    bgcolor: isDark ? alpha('#10b981', 0.2) : alpha('#10b981', 0.15),
                    transform: 'translateX(8px)',
                    boxShadow: isDark
                      ? '0 4px 15px rgba(16, 185, 129, 0.3)'
                      : '0 4px 15px rgba(16, 185, 129, 0.2)',
                  },
                  '@keyframes slideIn': {
                    from: {
                      opacity: 0,
                      transform: 'translateX(-20px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateX(0)',
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: isDark
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: isDark
                      ? '0 2px 10px rgba(16, 185, 129, 0.4)'
                      : '0 2px 10px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    fontWeight: 500,
                    color: isDark ? '#d1fae5' : '#065f46',
                  }}
                >
                  {criterio}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Modal Visor */}
      <ModalVisorDocumento
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        documento={documentoSeleccionado}
      />
    </>
  );
}