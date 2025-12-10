// components/preinscripcion/revision/ModalVisorDocumento.tsx
'use client';
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';

interface ModalVisorDocumentoProps {
  open: boolean;
  onClose: () => void;
  documento: {
    nombre: string;
    archivo: string;
    url?: string;
  } | null;
}

export default function ModalVisorDocumento({
  open,
  onClose,
  documento,
}: ModalVisorDocumentoProps) {
  if (!documento) return null;

  const isImage = documento.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPDF = documento.url?.match(/\.pdf$/i);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '80vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <DescriptionIcon color="primary" />
        <Box flex={1}>
          <Typography variant="h6" fontWeight={700}>
            {documento.nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {documento.archivo}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
          height: '70vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'grey.100',
        }}
      >
        {documento.url ? (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'auto',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
              borderRadius: 2,
            }}
          >
            {isImage ? (
              <img
                src={documento.url}
                alt={documento.nombre}
                style={{
                  maxWidth: '90%',
                  maxHeight: '90%',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
              />
            ) : isPDF ? (
              <iframe
                src={documento.url}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px',
                }}
                title="Vista previa del documento"
              />
            ) : (
              <Box textAlign="center" p={4}>
                <DescriptionIcon
                  sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }}
                />
                <Typography
                  variant="h6"
                  color="text.secondary"
                  gutterBottom
                >
                  Vista previa no disponible
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={3}
                >
                  Este tipo de archivo no se puede previsualizar
                </Typography>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={() => window.open(documento.url, '_blank')}
                  variant="contained"
                >
                  Descargar archivo
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Typography color="text.secondary">
            No hay URL disponible
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          startIcon={<DownloadIcon />}
          onClick={() => window.open(documento.url, '_blank')}
          variant="outlined"
          disabled={!documento.url}
        >
          Descargar
        </Button>
        <Button onClick={onClose} variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}