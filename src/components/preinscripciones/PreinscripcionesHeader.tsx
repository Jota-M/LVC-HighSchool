// src/app/dashboard/preinscripciones/components/PreinscripcionesHeader.tsx

import React from 'react';
import { Box, Typography, Stack, Button, IconButton, Tooltip, Fade } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import AddIcon from '@mui/icons-material/Add';

interface PreinscripcionesHeaderProps {
  onRefresh: () => void;
  onExport: () => void;
  onNew?: () => void;
}

export const PreinscripcionesHeader: React.FC<PreinscripcionesHeaderProps> = ({
  onRefresh,
  onExport,
  onNew,
}) => {
  return (
    <Fade in timeout={600}>
      <Box mb={4}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Preinscripciones
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestiona y supervisa todas las solicitudes de inscripción
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Actualizar">
              <IconButton 
                onClick={onRefresh}
                sx={{ 
                  bgcolor: 'success.main',
                  color: '#fff',
                  '&:hover': { bgcolor: 'success.dark' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exportar">
              <IconButton 
                onClick={onExport}
                sx={{ 
                  bgcolor: 'primary.main',
                  color: '#fff',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <CloudDownloadIcon />
              </IconButton>
            </Tooltip>
            {onNew && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onNew}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  px: 3,
                }}
              >
                Nueva
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
    </Fade>
  );
};