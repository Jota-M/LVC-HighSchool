// src/components/preinscripciones/PreinscripcionesHeader.tsx

import React from 'react';
import { 
  Box, 
  Typography, 
  Stack, 
  Button, 
  IconButton, 
  Tooltip, 
  Fade,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import AddIcon from '@mui/icons-material/Add';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import SettingsIcon from '@mui/icons-material/Settings';

interface PreinscripcionesHeaderProps {
  onRefresh: () => void;
  onExport: () => void;
  onExportPDF?: () => void;
  onNew?: () => void;
}

export const PreinscripcionesHeader: React.FC<PreinscripcionesHeaderProps> = ({
  onRefresh,
  onExport,
  onExportPDF,
  onNew,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportExcel = () => {
    handleMenuClose();
    onExport();
  };

  const handleExportPDF = () => {
    handleMenuClose();
    if (onExportPDF) {
      onExportPDF();
    }
  };

  return (
    <Fade in timeout={600}>
      <Box mb={4}>
        <Stack 
          direction="row" 
          alignItems="center" 
          justifyContent="space-between" 
          flexWrap="wrap" 
          gap={2}
        >
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
                onClick={handleMenuOpen}
                sx={{ 
                  bgcolor: 'primary.main',
                  color: '#fff',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <CloudDownloadIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Gestionar Cupos">
              <IconButton 
                onClick={() => window.location.href = '/dashboard/cupos'}
                sx={{ 
                  bgcolor: 'info.main',
                  color: '#fff',
                  '&:hover': { bgcolor: 'info.dark' }
                }}
              >
                <SettingsIcon />
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

        {/* MENÚ DE EXPORTACIÓN */}
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              minWidth: 200,
              mt: 1,
            },
          }}
        >
          <MenuItem onClick={handleExportExcel}>
            <ListItemIcon>
              <TableChartIcon fontSize="small" sx={{ color: '#107C41' }} />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2" fontWeight={600}>
                Exportar a Excel
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Descarga archivo .xlsx
              </Typography>
            </ListItemText>
          </MenuItem>

          {onExportPDF && (
            <MenuItem onClick={handleExportPDF}>
              <ListItemIcon>
                <PictureAsPdfIcon fontSize="small" sx={{ color: '#dc2626' }} />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2" fontWeight={600}>
                  Exportar a PDF
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Descarga archivo .pdf
                </Typography>
              </ListItemText>
            </MenuItem>
          )}
        </Menu>
      </Box>
    </Fade>
  );
};