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
  IconButton,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';

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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';

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
          borderRadius: '20px',
          border: `1px solid ${alpha(accent, 0.25)}`,
          backgroundImage: 'none',
          overflow: 'hidden',
          minHeight: '80vh',
        },
      }}
    >
      {/* Título con el gradiente de Cupos */}
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            px: 3,
            py: 2.2,
            background: isDark
              ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
              : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                bgcolor: isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDark ? '#000' : '#fff',
              }}
            >
              <DescriptionIcon />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ color: isDark ? '#000' : '#fff', lineHeight: 1.2 }}
              >
                {documento.nombre}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)' }}
              >
                {documento.archivo}
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: isDark ? '#000' : '#fff',
              bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
              '&:hover': {
                bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.35)',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
          height: '70vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: isDark ? alpha(theme.palette.background.default, 0.95) : 'grey.100',
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
              bgcolor: isDark ? alpha('#000', 0.4) : '#ffffff',
              borderRadius: '14px',
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              p: 2,
            }}
          >
            {isImage ? (
              <img
                src={documento.url}
                alt={documento.nombre}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 8,
                }}
              />
            ) : isPDF ? (
              <iframe
                src={`${documento.url}#view=FitH`}
                width="100%"
                height="100%"
                style={{ border: 'none', borderRadius: 8 }}
                title={documento.nombre}
              />
            ) : (
              <Box textAlign="center" p={4}>
                <DescriptionIcon sx={{ fontSize: 64, color: accent, mb: 2 }} />
                <Typography variant="body1" fontWeight={600} mb={1}>
                  Archivo no visualizable directamente
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  component="a"
                  href={documento.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    borderRadius: '12px',
                    background: isDark
                      ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                    color: isDark ? '#000' : '#fff',
                    fontWeight: 700,
                  }}
                >
                  Descargar Archivo
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Box textAlign="center" p={4}>
            <Typography variant="body1" color="text.secondary">
              No hay archivo cargado para este requisito
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 2.5,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
          justifyContent: 'space-between',
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            borderRadius: '10px',
            color: 'text.secondary',
            fontWeight: 600,
          }}
        >
          Cerrar
        </Button>

        {documento.url && (
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            component="a"
            href={documento.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              background: isDark
                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
              color: isDark ? '#000' : '#fff',
              boxShadow: isDark
                ? '0 4px 14px rgba(250,204,21,0.3)'
                : '0 4px 14px rgba(2,136,209,0.3)',
            }}
          >
            Descargar Documento
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}