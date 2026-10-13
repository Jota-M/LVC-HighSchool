// components/preinscripcion/revision/PasoDocumentos.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  TextField,
  Button,
  Divider,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import EditNoteIcon from '@mui/icons-material/EditNote';
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
  const accent = isDark ? '#facc15' : '#0288d1';
  const accentDark = isDark ? '#f59e0b' : '#01579b';

  const [modalOpen, setModalOpen] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<any>(null);

  const documentos = [
    {
      id: 1,
      nombre: 'Cédula de Identidad del Estudiante',
      archivo: 'Documento de identidad o pasaporte',
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
      archivo: 'Certificado de nacimiento oficial',
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
      nombre: 'Libreta de Notas / Calificaciones',
      archivo: 'Libreta del año escolar previo',
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
      nombre: 'Cédula del Representante / Tutor',
      archivo: 'Documento del tutor principal',
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
    'Documentos legibles, íntegros y de buena calidad digital',
    'Coincidencia exacta de nombres, apellidos y fechas de nacimiento',
    'Cédulas vigentes y sellos oficiales visibles',
    'Libreta con visto bueno del colegio de origen',
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
      month: 'short',
      day: 'numeric',
    });
  };

  const docsDisponibles = documentos.filter((d) => d.disponible).length;
  const docsPorcentaje = Math.round((docsDisponibles / documentos.length) * 100);

  const cardStyle = {
    borderRadius: '24px',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    background: isDark
      ? 'linear-gradient(180deg, #0e1726 0%, #0b1320 100%)'
      : '#ffffff',
    boxShadow: isDark
      ? '0 12px 36px rgba(0, 0, 0, 0.45)'
      : '0 8px 24px rgba(0,0,0,0.06)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <>
      {/* HEADER DEL PASO */}
      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 2.5,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? '#000' : '#fff',
                  boxShadow: isDark
                    ? '0 4px 16px rgba(250,204,21,0.35)'
                    : '0 4px 16px rgba(2,136,209,0.35)',
                }}
              >
                <DescriptionIcon sx={{ fontSize: 28 }} />
              </Box>

              <Box>
                <Typography variant="h5" fontWeight={700} color="text.primary">
                  Paso 1: Verificación de Documentos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Revisa y valida la autenticidad de los archivos adjuntos
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
              label={`Iniciado: ${formatearFecha(preinscripcion.fecha_inicio)}`}
              sx={{
                borderRadius: '10px',
                fontWeight: 600,
                bgcolor: alpha(accent, 0.12),
                color: accent,
                border: `1px solid ${alpha(accent, 0.3)}`,
              }}
            />
          </Box>

          {/* Barra de progreso de requisitos */}
          <Box
            sx={{
              p: 2,
              borderRadius: '16px',
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(0, 0, 0, 0.02)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" fontWeight={700} color={accent}>
                DOCUMENTOS CARGADOS: {docsDisponibles} DE {documentos.length}
              </Typography>
              <Typography variant="caption" fontWeight={700} color="text.primary">
                {docsPorcentaje}% completo
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={docsPorcentaje}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: isDark ? alpha('#fff', 0.1) : alpha(accent, 0.15),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: isDark
                    ? 'linear-gradient(90deg, #facc15, #f59e0b)'
                    : 'linear-gradient(90deg, #0288d1, #01579b)',
                },
              }}
            />
          </Box>

          {/* Lista de Documentos */}
          <Typography
            variant="subtitle2"
            fontWeight={700}
            color="text.primary"
            sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Box
              sx={{
                width: 4,
                height: 18,
                borderRadius: 1,
                bgcolor: accent,
              }}
            />
            Archivos del Postulante
          </Typography>

          <Stack spacing={2} sx={{ mb: 3 }}>
            {documentos.map((doc) => (
              <DocumentoCard
                key={doc.id}
                nombre={doc.nombre}
                archivo={doc.archivo}
                disponible={doc.disponible}
                icon={doc.icon}
                onVer={() => handleVerDocumento(doc)}
              />
            ))}
          </Stack>

          <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.6) }} />

          {/* Observaciones y Notas */}
          <Typography
            variant="subtitle2"
            fontWeight={700}
            color="text.primary"
            sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <EditNoteIcon sx={{ color: accent }} />
            Observaciones sobre la Documentación:
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Escribe observaciones aquí si algún documento falta o es ilegible..."
            value={notasDocumentos}
            onChange={(e) => setNotasDocumentos(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
                bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                '&.Mui-focused fieldset': {
                  borderColor: accent,
                  borderWidth: 2,
                },
              },
            }}
          />

          {/* Botones de Acción */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => rechazar(notasDocumentos)}
              disabled={saving}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 2.5,
                py: 1.2,
                borderColor: alpha('#ef4444', 0.5),
                color: '#ef4444',
                backgroundColor: alpha('#ef4444', 0.05),
                '&:hover': {
                  borderColor: '#ef4444',
                  backgroundColor: alpha('#ef4444', 0.12),
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Rechazar Preinscripción
            </Button>

            <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
              <Button
                variant="outlined"
                startIcon={<EditNoteIcon />}
                onClick={() => solicitarDocumentos(notasDocumentos)}
                disabled={saving}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                  py: 1.2,
                  borderColor: alpha(accent, 0.5),
                  color: accent,
                  backgroundColor: alpha(accent, 0.05),
                  '&:hover': {
                    borderColor: accent,
                    backgroundColor: alpha(accent, 0.12),
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Solicitar Corrección
              </Button>

              <Button
                variant="contained"
                startIcon={<TaskAltIcon />}
                onClick={aprobarDocumentos}
                disabled={saving}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 3,
                  py: 1.2,
                  background: isDark
                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                  color: isDark ? '#000' : '#fff',
                  boxShadow: isDark
                    ? '0 6px 20px rgba(250,204,21,0.3)'
                    : '0 6px 20px rgba(2,136,209,0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: isDark
                      ? '0 8px 24px rgba(250,204,21,0.45)'
                      : '0 8px 24px rgba(2,136,209,0.45)',
                  },
                  transition: 'all 0.25s ease',
                }}
              >
                {saving ? 'Validando...' : 'Aprobar Documentos y Continuar'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* TARJETA DE CRITERIOS DE REVISIÓN */}
      <Paper elevation={0} sx={{ ...cardStyle, mt: 3, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 5,
              height: 20,
              borderRadius: 1,
              bgcolor: '#10b981',
            }}
          />
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            Criterios Institucionales de Validación
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 1.5,
          }}
        >
          {criteriosVerificacion.map((criterio, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.8,
                borderRadius: '14px',
                bgcolor: isDark ? alpha('#10b981', 0.08) : alpha('#10b981', 0.05),
                border: `1px solid ${alpha('#10b981', 0.25)}`,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />
              <Typography variant="body2" fontWeight={500} color="text.primary">
                {criterio}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Modal Visor de Documentos */}
      <ModalVisorDocumento
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        documento={documentoSeleccionado}
      />
    </>
  );
}